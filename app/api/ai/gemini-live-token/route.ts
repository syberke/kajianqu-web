import { GoogleGenAI, Modality } from '@google/genai'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const GEMINI_LIVE_MODEL = 'gemini-3.1-flash-live-preview'
const SYSTEM_INSTRUCTION =
  'Transcribe incoming Quran recitation in Arabic script faithfully. Do not greet, coach, answer, or speak. The application performs canonical Quran verse alignment from the input transcription.'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Silakan masuk terlebih dahulu untuk memakai koreksi bacaan live.' },
      { status: 401 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di server.' },
      { status: 503 },
    )
  }

  try {
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    })
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString()

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: GEMINI_LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    })

    return NextResponse.json({
      token: token.name,
      model: GEMINI_LIVE_MODEL,
    })
  } catch (error) {
    console.error('Failed to create Gemini Live ephemeral token', error)
    return NextResponse.json(
      { error: 'Sesi Gemini Live gagal dibuat. Periksa API key dan akses model Live.' },
      { status: 502 },
    )
  }
}
