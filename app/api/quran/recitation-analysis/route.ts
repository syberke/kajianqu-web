import { GoogleGenAI, Type } from '@google/genai'
import { NextResponse } from 'next/server'

import { DEFAULT_GEMINI_ANALYSIS_MODEL } from '@/lib/gemini-live-config'
import { createClient } from '@/lib/supabase/server'
import type { QuranRecitationAnalysis } from '@/types/quran'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

const MAX_AUDIO_BYTES = 18 * 1024 * 1024

const SCORE_FEEDBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
  },
  required: ['score', 'feedback'],
}

const RECITATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    makhraj: SCORE_FEEDBACK_SCHEMA,
    tajwid: SCORE_FEEDBACK_SCHEMA,
    mad: SCORE_FEEDBACK_SCHEMA,
    ghunnah: SCORE_FEEDBACK_SCHEMA,
    qalqalah: SCORE_FEEDBACK_SCHEMA,
    waqafIbtida: SCORE_FEEDBACK_SCHEMA,
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ayahNumber: { type: Type.NUMBER },
          word: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ['makhraj', 'tajwid', 'mad', 'ghunnah', 'qalqalah', 'waqaf_ibtida', 'hukum_bacaan', 'lafaz'],
          },
          severity: { type: Type.STRING, enum: ['ringan', 'sedang', 'utama'] },
          observation: { type: Type.STRING },
          suggestion: { type: Type.STRING },
        },
        required: ['category', 'severity', 'observation', 'suggestion'],
      },
    },
  },
  required: [
    'overallScore',
    'summary',
    'makhraj',
    'tajwid',
    'mad',
    'ghunnah',
    'qalqalah',
    'waqafIbtida',
    'issues',
  ],
} as const

function isScoreFeedback(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const item = value as { score?: unknown; feedback?: unknown }
  return typeof item.score === 'number' && typeof item.feedback === 'string'
}

function isAnalysis(value: unknown): value is QuranRecitationAnalysis {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<QuranRecitationAnalysis>
  return (
    typeof item.overallScore === 'number' &&
    typeof item.summary === 'string' &&
    isScoreFeedback(item.makhraj) &&
    isScoreFeedback(item.tajwid) &&
    isScoreFeedback(item.mad) &&
    isScoreFeedback(item.ghunnah) &&
    isScoreFeedback(item.qalqalah) &&
    isScoreFeedback(item.waqafIbtida) &&
    Array.isArray(item.issues)
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(`recitation:${requestIdentity(request, user.id)}`, 12, 60 * 60 * 1_000)
  if (!rate.allowed) return NextResponse.json({ error: 'Batas analisis bacaan sementara tercapai.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Form audio tidak valid' }, { status: 400 })

  const audio = formData.get('audio')
  const expectedText = String(formData.get('expectedText') ?? '').trim()
  const transcript = String(formData.get('transcript') ?? '').trim()
  const surahName = String(formData.get('surahName') ?? '').trim()
  const ayahStart = Number(formData.get('ayahStart'))
  const ayahEnd = Number(formData.get('ayahEnd'))

  if (!(audio instanceof File) || audio.size === 0 || !audio.type.startsWith('audio/')) {
    return NextResponse.json({ error: 'Rekaman audio wajib dikirim' }, { status: 400 })
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: 'Rekaman terlalu besar. Maksimal 18 MB per analisis.' }, { status: 413 })
  }
  if (!expectedText || !surahName || !Number.isInteger(ayahStart) || !Number.isInteger(ayahEnd)) {
    return NextResponse.json({ error: 'Konteks ayat tidak lengkap' }, { status: 400 })
  }
  if (expectedText.length > 30_000 || transcript.length > 30_000 || surahName.length > 100) {
    return NextResponse.json({ error: 'Konteks bacaan terlalu panjang.' }, { status: 413 })
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
              text: `Analisis rekaman bacaan Al-Qur'an ini sebagai pendamping latihan audio, bukan keputusan talaqqi final.

Konteks: Surah ${surahName}, ayat ${ayahStart}-${ayahEnd}.
Teks Qur'an canonical yang diharapkan:
${expectedText}

Transkrip otomatis Gemini Live sebagai referensi sekunder:
${transcript || '(transkrip kosong)'}

Dengarkan audio dengan teliti. Nilai hanya hal yang benar-benar terdengar. Fokus pada:
1. indikasi makhraj atau artikulasi huruf,
2. tajwid dan hukum bacaan yang terdengar,
3. panjang-pendek mad,
4. ghunnah,
5. qalqalah,
6. waqaf dan ibtida,
7. lafaz yang jelas berubah atau terlewat.

Gunakan bahasa Indonesia yang konkret dan edukatif. Untuk hal akustik yang tidak pasti, pakai kata seperti "terdengar" atau "terindikasi" dan jangan mengarang kesalahan. Skor 0-100 hanya skor latihan AI. Berikan issue spesifik bila memang terdengar dan saran perbaikannya.`,
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
        responseSchema: RECITATION_SCHEMA,
        temperature: 0.1,
      },
    })

    const rawText = response.text
    if (!rawText) throw new Error('Gemini tidak mengembalikan analisis')

    const parsed = JSON.parse(rawText) as unknown
    if (!isAnalysis(parsed)) throw new Error('Struktur analisis Gemini tidak valid')

    return NextResponse.json({ analysis: parsed })
  } catch (error) {
    console.error('Quran recitation analysis failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal menganalisis bacaan' },
      { status: 502 },
    )
  }
}
