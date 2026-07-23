import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

const liveSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(4_000).optional(),
  provider: z.enum(['youtube', 'zoom', 'external']),
  startsAt: z.iso.datetime(),
  estimatedMinutes: z.coerce.number().int().min(10).max(720),
  eventUrl: z.url().max(500),
  passcode: z.string().trim().max(80).optional(),
  visibility: z.enum(['public', 'members']).default('public'),
})

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await db.liveEvent.findMany({
    where: { asatidzId: user.id },
    orderBy: { startsAt: 'desc' },
  })
  return NextResponse.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      provider: session.provider,
      startsAt: session.startsAt.toISOString(),
      estimatedMinutes: session.estimatedMinutes,
      eventUrl: session.eventUrl,
      passcode: session.passcode,
      visibility: session.visibility,
      status: session.status,
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = liveSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data live belum lengkap atau tidak valid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  const data = parsed.data
  if (data.provider === 'zoom' && !data.passcode?.trim()) {
    return NextResponse.json({ error: 'Passcode wajib diisi untuk live Zoom.' }, { status: 400 })
  }

  const session = await db.liveEvent.create({
    data: {
      title: data.title,
      description: data.description?.trim() || null,
      provider: data.provider,
      startsAt: new Date(data.startsAt),
      estimatedMinutes: data.estimatedMinutes,
      eventUrl: data.eventUrl,
      passcode: data.passcode?.trim() || null,
      visibility: data.visibility,
      status: new Date(data.startsAt).getTime() <= Date.now() ? 'live' : 'scheduled',
      asatidzId: user.id,
    },
  })
  return NextResponse.json({ session: { id: session.id, status: session.status } }, { status: 201 })
}
