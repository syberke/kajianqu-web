import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const readSchema = z.object({
  id: z.uuid().optional(),
  all: z.boolean().optional(),
}).refine((value) => value.id || value.all, { message: 'Pilih notifikasi yang akan dibaca' })

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ where: { recipientId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    db.notification.count({ where: { recipientId: user.id, isRead: false } }),
  ])
  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = readSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 })

  const result = await db.notification.updateMany({
    where: { recipientId: user.id, isRead: false, ...(parsed.data.all ? {} : { id: parsed.data.id }) },
    data: { isRead: true },
  })
  return NextResponse.json({ updated: result.count })
}
