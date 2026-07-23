import { NextResponse } from 'next/server'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

interface LivePayload {
  title?: string
  description?: string
  youtubeUrl?: string
  scheduledAt?: string
}

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await db.liveSession.findMany({
    where: { asatidzId: user.id },
    orderBy: { scheduledAt: 'desc' },
  })

  return NextResponse.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      youtubeUrl: session.youtubeUrl,
      streamUrl: session.streamUrl,
      status: session.status,
      scheduledAt: session.scheduledAt?.toISOString() ?? null,
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as LivePayload | null
  const title = payload?.title?.trim()
  const scheduledAt = payload?.scheduledAt ? new Date(payload.scheduledAt) : null
  if (!title || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: 'Judul dan jadwal live wajib valid' }, { status: 400 })
  }

  const session = await db.liveSession.create({
    data: {
      title,
      description: payload?.description?.trim() || null,
      youtubeUrl: payload?.youtubeUrl?.trim() || null,
      streamUrl: payload?.youtubeUrl?.trim() || null,
      status: scheduledAt.getTime() <= Date.now() ? 'live' : 'upcoming',
      asatidzId: user.id,
      scheduledAt,
    },
  })

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      description: session.description,
      youtubeUrl: session.youtubeUrl,
      streamUrl: session.streamUrl,
      status: session.status,
      scheduledAt: session.scheduledAt?.toISOString() ?? null,
    },
  }, { status: 201 })
}
