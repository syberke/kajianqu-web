import { GoogleGenAI, Modality } from '@google/genai'
import { NextResponse } from 'next/server'

import { DEFAULT_GEMINI_LIVE_MODEL, GEMINI_LIVE_SYSTEM_INSTRUCTION } from '@/lib/gemini-live-config'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

export async function POST(request: Request) {
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

  const rate = checkRateLimit(`gemini-live:${requestIdentity(request, user.id)}`, 30, 60 * 60 * 1_000)
  if (!rate.allowed) return NextResponse.json({ error: 'Batas sesi live sementara tercapai.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di server.' },
      { status: 503 },
    )
  }

  const model = process.env.GEMINI_LIVE_MODEL || DEFAULT_GEMINI_LIVE_MODEL

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
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: {
              parts: [{ text: GEMINI_LIVE_SYSTEM_INSTRUCTION }],
            },
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    })

    return NextResponse.json({
      token: token.name,
      model,
    })
  } catch (error) {
    console.error('Failed to create Gemini Live ephemeral token', error)
    return NextResponse.json(
      { error: 'Sesi Gemini Live gagal dibuat. Periksa API key dan akses model Live.' },
      { status: 502 },
    )
  }
}
