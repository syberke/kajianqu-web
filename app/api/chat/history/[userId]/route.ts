import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ userId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await params
  const counterpart = await db.profile.findUnique({
    where: { id: userId },
    select: { id: true, nama: true, fotoUrl: true, role: true },
  })
  if (!counterpart) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: userId },
        { senderId: userId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  })

  return NextResponse.json({
    counterpart: {
      id: counterpart.id,
      nama: counterpart.nama,
      fotoUrl: counterpart.fotoUrl,
      role: counterpart.role,
    },
    messages: messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt?.toISOString() ?? null,
      mine: message.senderId === user.id,
    })),
  })
}
