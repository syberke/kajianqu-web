import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import type { QuranMode, SessionMistake } from '@/types/quran'

interface SessionPayload {
  mode: QuranMode
  surahId: number
  surahName: string
  ayahStart: number
  ayahEnd: number
  totalWords: number
  correctWords: number
  accuracy: number
  mistakes: SessionMistake[]
  durationSeconds?: number
  transcript?: string
}

function isSessionPayload(payload: unknown): payload is SessionPayload {
  if (!payload || typeof payload !== 'object') return false
  const value = payload as Partial<SessionPayload>
  return (
    (value.mode === 'ziyadah' || value.mode === 'murojaah') &&
    Number.isInteger(value.surahId) &&
    typeof value.surahName === 'string' &&
    Number.isInteger(value.ayahStart) &&
    Number.isInteger(value.ayahEnd) &&
    Number.isInteger(value.totalWords) &&
    Number.isInteger(value.correctWords) &&
    typeof value.accuracy === 'number' &&
    Array.isArray(value.mistakes)
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as unknown
  if (!isSessionPayload(payload)) {
    return NextResponse.json({ error: 'Payload sesi Qur’an tidak valid' }, { status: 400 })
  }

  const session = await db.$transaction(async (tx) => {
    const created = await tx.quranSession.create({
      data: {
        userId: user.id,
        mode: payload.mode,
        surahId: payload.surahId,
        surahName: payload.surahName,
        ayahStart: payload.ayahStart,
        ayahEnd: payload.ayahEnd,
        totalWords: payload.totalWords,
        correctWords: payload.correctWords,
        accuracy: payload.accuracy,
        mistakes: payload.mistakes as unknown as Prisma.InputJsonValue,
        transcript: payload.transcript,
        durationSeconds: payload.durationSeconds,
      },
    })

    if (payload.mistakes.length > 0) {
      await tx.quranMistake.createMany({
        data: payload.mistakes.map((mistake) => ({
          sessionId: created.id,
          userId: user.id,
          surahId: payload.surahId,
          ayahNumber: mistake.ayahNumber,
          wordArabic: mistake.wordArabic,
          wordSpoken: mistake.wordSpoken,
          kind: mistake.kind,
          confidence: mistake.confidence,
        })),
      })
    }

    return created
  })

  return NextResponse.json({ id: session.id }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get('limit') ?? 20)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100) : 20

  const sessions = await db.quranSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      mode: true,
      surahName: true,
      ayahStart: true,
      ayahEnd: true,
      accuracy: true,
      correctWords: true,
      totalWords: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    sessions: sessions.map((session) => ({
      ...session,
      createdAt: session.createdAt.toISOString(),
    })),
  })
}
