import { GoogleGenAI, Type } from '@google/genai'
import { NextResponse } from 'next/server'

import { DEFAULT_GEMINI_ANALYSIS_MODEL } from '@/lib/gemini-live-config'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'
import type { QuranRecitationAnalysis, SessionMistake } from '@/types/quran'

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

function normalizeAudioMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase()
  if (normalized.includes('ogg')) return 'audio/ogg'
  if (normalized.includes('wav')) return 'audio/wav'
  if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'audio/mpeg'
  if (normalized.includes('mp4') || normalized.includes('m4a')) return 'audio/mp4'
  return 'audio/webm'
}

function parseAlignmentMistakes(rawValue: string): SessionMistake[] {
  if (!rawValue) return []

  try {
    const value = JSON.parse(rawValue) as unknown
    if (!Array.isArray(value)) return []

    return value
      .filter((item): item is SessionMistake => {
        if (!item || typeof item !== 'object') return false
        const mistake = item as Partial<SessionMistake>
        return (
          typeof mistake.wordArabic === 'string' &&
          typeof mistake.wordSpoken === 'string' &&
          typeof mistake.ayahNumber === 'number' &&
          typeof mistake.wordIndex === 'number'
        )
      })
      .slice(0, 200)
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(`recitation:${requestIdentity(request, user.id)}`, 30, 60 * 60 * 1_000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Batas analisis bacaan sementara tercapai.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    )
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Form audio tidak valid' }, { status: 400 })

  const audio = formData.get('audio')
  const expectedText = String(formData.get('expectedText') ?? '').trim()
  const transcript = String(formData.get('transcript') ?? '').trim()
  const surahName = String(formData.get('surahName') ?? '').trim()
  const ayahStart = Number(formData.get('ayahStart'))
  const ayahEnd = Number(formData.get('ayahEnd'))
  const alignmentAccuracy = Number(formData.get('alignmentAccuracy'))
  const alignmentMistakes = parseAlignmentMistakes(
    String(formData.get('alignmentMistakes') ?? ''),
  )

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

Target latihan: Surah ${surahName}, ayat ${ayahStart}-${ayahEnd}.
Teks target untuk dibandingkan, bukan untuk menebak suara:
${expectedText}

Transkrip literal dari rekaman penuh:
${transcript || '(transkrip kosong)'}

Hasil pencocokan kata deterministik:
- Akurasi: ${Number.isFinite(alignmentAccuracy) ? alignmentAccuracy.toFixed(2) : 'tidak tersedia'}%
- Perbedaan: ${JSON.stringify(alignmentMistakes)}

Aturan penilaian wajib:
1. Nilai hanya suara yang benar-benar terdengar. Jangan menganggap teks target dibaca hanya karena tersedia di prompt.
2. Tandai kata yang hanya dibaca sebagian, awal atau akhirnya terpotong, atau artikulasinya berhenti di tengah kata.
3. Tandai jeda panjang yang menyebabkan kata atau rangkaian kata terlewat, termasuk ketika pembaca langsung melompat ke bagian akhir.
4. Jika bacaan berasal dari surat atau rentang ayat lain, jelaskan bahwa lafaz berbeda dari target. Jangan mengubahnya agar cocok dengan target.
5. Gunakan hasil pencocokan deterministik sebagai bukti kata terlewat, berbeda, atau tambahan. Jangan menaikkan skor jika banyak kata hilang.
6. Bedakan kesalahan lafaz dari makhraj, tajwid, mad, ghunnah, qalqalah, serta waqaf dan ibtida.
7. Untuk setiap masalah yang jelas, tuliskan kata atau bagian terkait, apa yang terdengar, mengapa berbeda, dan latihan perbaikannya.
8. Jika aspek akustik tidak pasti, gunakan kata "terindikasi" dan jangan mengarang kesalahan.
9. Skor 0-100 hanya skor latihan AI. Bacaan dengan kata terlewat atau surat yang berbeda tidak boleh mendapat skor tinggi.

Gunakan bahasa Indonesia yang konkret, rinci, dan mudah dipraktikkan.`,
            },
            {
              inlineData: {
                mimeType: normalizeAudioMimeType(audio.type),
                data: audioData,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: RECITATION_SCHEMA,
        temperature: 0,
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
