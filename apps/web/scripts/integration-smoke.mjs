import { GoogleGenAI, Modality } from '@google/genai'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'

for (const filename of ['.env', '.env.local']) {
  if (!existsSync(filename)) continue
  for (const line of readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2')
    if (process.env[key] === undefined || filename === '.env.local') process.env[key] = value
  }
}

const secrets = [
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.GEMINI_API_KEY,
  process.env.DEEPGRAM_API_KEY,
].filter(Boolean)

function safeMessage(error) {
  let message = error instanceof Error ? error.message : String(error)
  for (const secret of secrets) message = message.replaceAll(secret, '[REDACTED]')
  return message
}

const checks = []

async function check(name, action) {
  const startedAt = Date.now()
  try {
    const detail = await action()
    checks.push({ name, ok: true })
    console.log(`PASS ${name} (${Date.now() - startedAt}ms)${detail ? `: ${detail}` : ''}`)
  } catch (error) {
    checks.push({ name, ok: false })
    console.error(`FAIL ${name} (${Date.now() - startedAt}ms): ${safeMessage(error)}`)
  }
}

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} belum diisi`)
  return value
}

async function testPrisma(name, datasourceUrl) {
  const prisma = new PrismaClient({ datasourceUrl })
  try {
    const rows = await prisma.$queryRaw`select 1 as connected`
    if (rows[0]?.connected !== 1) throw new Error('Database tidak mengembalikan hasil yang diharapkan')
    return 'SELECT 1 berhasil'
  } finally {
    await prisma.$disconnect()
  }
}

async function waitForLiveSetup(socket, setup) {
  await new Promise((resolve, reject) => {
    let opened = false
    let receivedMessages = 0
    const timer = setTimeout(() => {
      socket.close()
      reject(
        new Error(
          `Setup Gemini Live timeout setelah 20 detik (socket terbuka: ${opened ? 'ya' : 'tidak'}, pesan diterima: ${receivedMessages})`,
        ),
      )
    }, 20_000)

    socket.onopen = () => {
      opened = true
      socket.send(JSON.stringify({ setup }))
    }

    socket.onmessage = (event) => {
      receivedMessages += 1
      const message = JSON.parse(String(event.data))
      if (message.error) {
        clearTimeout(timer)
        reject(new Error(message.error.message || 'Gemini Live menolak setup'))
        return
      }
      if (message.setupComplete) {
        clearTimeout(timer)
        socket.close(1000, 'smoke test complete')
        resolve()
      }
    }

    socket.onerror = () => {
      clearTimeout(timer)
      reject(new Error('WebSocket Gemini Live gagal'))
    }

    socket.onclose = (event) => {
      if (event.code !== 1000) {
        clearTimeout(timer)
        reject(new Error(`WebSocket ditutup dengan kode ${event.code}: ${event.reason || 'tanpa alasan'}`))
      }
    }
  })
}

function liveSetup(model) {
  return {
    model: `models/${model}`,
    responseModalities: ['AUDIO'],
    inputAudioTranscription: {},
    systemInstruction: {
      parts: [
        {
          text: 'Transcribe incoming Quran recitation in Arabic script faithfully. Do not greet, coach, answer, or speak.',
        },
      ],
    },
  }
}

async function testGeminiLiveDirect() {
  const apiKey = required('GEMINI_API_KEY')
  const model =
    process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025'
  const endpoint =
    'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'
  const socket = new WebSocket(`${endpoint}?key=${encodeURIComponent(apiKey)}`)
  await waitForLiveSetup(socket, liveSetup(model))
  return `setup langsung ${model} berhasil`
}

async function testGeminiLiveSdk() {
  const model =
    process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025'
  const ai = new GoogleGenAI({ apiKey: required('GEMINI_API_KEY') })
  let callbackError

  const session = await Promise.race([
    ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen() {},
        onmessage() {},
        onerror(event) {
          callbackError = event?.message || 'Live SDK WebSocket error'
        },
        onclose() {},
      },
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Live SDK connect timeout setelah 20 detik')), 20_000),
    ),
  ])

  if (callbackError) throw new Error(callbackError)
  session.close()
  return `SDK berhasil membuka ${model}`
}

async function testGeminiLiveEphemeral() {
  const apiKey = required('GEMINI_API_KEY')
  const model =
    process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025'
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1alpha' },
  })

  const setup = liveSetup(model)
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(Date.now() + 30 * 60 * 1_000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 60 * 1_000).toISOString(),
      liveConnectConstraints: {
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: setup.systemInstruction,
        },
      },
      httpOptions: { apiVersion: 'v1alpha' },
    },
  })

  if (!token.name) throw new Error('Gemini tidak mengembalikan ephemeral token')

  const endpoint =
    'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained'
  const socket = new WebSocket(`${endpoint}?access_token=${encodeURIComponent(token.name)}`)
  await waitForLiveSetup(socket, setup)

  return `ephemeral token dan setup ${model} berhasil`
}

await check('Supabase Auth endpoint + anon key', async () => {
  const response = await fetch(`${required('NEXT_PUBLIC_SUPABASE_URL')}/auth/v1/health`, {
    headers: { apikey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY') },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return `HTTP ${response.status}`
})

await check('Supabase service role + PostgREST', async () => {
  const supabase = createClient(
    required('NEXT_PUBLIC_SUPABASE_URL'),
    required('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return `${count ?? 0} profile dapat dihitung`
})

await check('Prisma Transaction Pooler', () =>
  testPrisma('Transaction Pooler', required('DATABASE_URL')),
)

await check('Prisma Session Pooler', () =>
  testPrisma('Session Pooler', required('DIRECT_URL')),
)

await check('Gemini analysis model', async () => {
  const model = process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.5-flash'
  const ai = new GoogleGenAI({ apiKey: required('GEMINI_API_KEY') })
  const response = await ai.models.generateContent({
    model,
    contents: 'Balas hanya dengan kata OK.',
    config: { temperature: 0 },
  })
  if (!response.text?.trim()) throw new Error('Gemini tidak mengembalikan teks')
  return `${model} merespons`
})

await check('Gemini Live SDK handshake', testGeminiLiveSdk)
await check('Gemini Live direct raw handshake', testGeminiLiveDirect)
await check('Gemini Live ephemeral handshake', testGeminiLiveEphemeral)

const failed = checks.filter((item) => !item.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} integration checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
