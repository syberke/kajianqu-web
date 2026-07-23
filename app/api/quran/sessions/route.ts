import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import type { QuranMode, SessionMistake } from '@/types/quran'

interface SessionPayload {
  requestId: string
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isSessionPayload(payload: unknown): payload is SessionPayload {
  if (!payload || typeof payload !== 'object') return false
  const value = payload as Partial<SessionPayload>
  return (
    typeof value.requestId === 'string' &&
    UUID_PATTERN.test(value.requestId) &&
    (value.mode === 'murojaah' || value.mode === 'belajar') &&
    Number.isInteger(value.surahId) &&
    typeof value.surahName === 'string' &&
    Number.isInteger(value.ayahStart) &&
    Number.isInteger(value.ayahEnd) &&
    Number.isInteger(value.totalWords) &&
    Number.isInteger(value.correctWords) &&
    typeof value.accuracy === 'number' &&
    Number.isFinite(value.accuracy) &&
    Array.isArray(value.mistakes)
  )
}

function isPoolTimeout(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2024'
}

function databaseErrorResponse(error: unknown) {
  console.error('Quran session database operation failed', error)
  return NextResponse.json(
    {
      error: isPoolTimeout(error)
        ? 'Database sedang sibuk. Penyimpanan dapat dicoba kembali.'
        : 'Gagal menyimpan sesi Al-Qur’an.',
    },
    { status: isPoolTimeout(error) ? 503 : 500 },
  )
}

async function persistSession(payload: SessionPayload, userId: string) {
  return db.quranSession.upsert({
    where: { id: payload.requestId },
    update: {},
    create: {
      id: payload.requestId,
      userId,
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
      mistakeRows:
        payload.mistakes.length > 0
          ? {
              create: payload.mistakes.map((mistake) => ({
                userId,
                surahId: payload.surahId,
                ayahNumber: mistake.ayahNumber,
                wordArabic: mistake.wordArabic,
                wordSpoken: mistake.wordSpoken,
                kind: mistake.kind,
                confidence: mistake.confidence,
              })),
            }
          : undefined,
    },
  })
}

async function persistSessionWithRetry(payload: SessionPayload, userId: string) {
  try {
    return await persistSession(payload, userId)
  } catch (error) {
    if (!isPoolTimeout(error)) throw error
    await new Promise((resolve) => setTimeout(resolve, 350))
    return persistSession(payload, userId)
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as unknown
  if (!isSessionPayload(payload)) {
    return NextResponse.json({ error: 'Payload sesi Qur’an tidak valid' }, { status: 400 })
  }

  try {
    const session = await persistSessionWithRetry(payload, user.id)
    return NextResponse.json({ id: session.id }, { status: 201 })
  } catch (error) {
    return databaseErrorResponse(error)
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get('limit') ?? 20)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100) : 20

  try {
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
  } catch (error) {
    return databaseErrorResponse(error)
  }
}
