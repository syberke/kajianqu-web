import { GoogleGenAI, Type } from '@google/genai'
import { NextResponse } from 'next/server'

import { DEFAULT_GEMINI_ANALYSIS_MODEL } from '@/lib/gemini-live-config'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'

const MAX_AUDIO_BYTES = 18 * 1024 * 1024

const TRANSCRIPTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
  },
  required: ['transcript'],
} as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(
    `recitation-transcription:${requestIdentity(request, user.id)}`,
    30,
    60 * 60 * 1_000,
  )
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Batas transkripsi bacaan sementara tercapai.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    )
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Form audio tidak valid' }, { status: 400 })

  const audio = formData.get('audio')
  const expectedText = String(formData.get('expectedText') ?? '').trim()

  if (!(audio instanceof File) || audio.size === 0 || !audio.type.startsWith('audio/')) {
    return NextResponse.json({ error: 'Rekaman audio wajib dikirim' }, { status: 400 })
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Rekaman terlalu besar. Maksimal 18 MB.' }, { status: 413 })
  }
  if (!expectedText || expectedText.length > 30_000) {
    return NextResponse.json({ error: 'Teks ayat acuan tidak valid' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi' }, { status: 503 })
  }

  try {
    const audioData = Buffer.from(await audio.arrayBuffer()).toString('base64')
    const client = new GoogleGenAI({ apiKey })
    const response = await client.models.generateContent({
      model: process.env.GEMINI_ANALYSIS_MODEL || DEFAULT_GEMINI_ANALYSIS_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Transkripsikan bacaan Al-Qur'an yang benar-benar terdengar pada rekaman ke tulisan Arab.

Teks ayat acuan berikut hanya boleh dipakai untuk ejaan dan pencocokan kata:
${expectedText}

Jangan menambahkan kata yang tidak terdengar. Jangan memberi penjelasan, terjemahan, penilaian, atau markdown. Jika audio tidak dapat dipahami, kembalikan transcript kosong.`,
            },
            {
              inlineData: {
                mimeType: audio.type || 'audio/webm',
                data: audioData,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: TRANSCRIPTION_SCHEMA,
        temperature: 0,
      },
    })

    const rawText = response.text
    if (!rawText) throw new Error('Gemini tidak mengembalikan transkripsi')
    const parsed = JSON.parse(rawText) as { transcript?: unknown }
    const transcript = typeof parsed.transcript === 'string' ? parsed.transcript.trim() : ''
    if (!transcript) throw new Error('Bacaan tidak dapat ditranskripsikan dari rekaman')

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Quran recitation transcription failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mentranskripsikan bacaan' },
      { status: 502 },
    )
  }
}
