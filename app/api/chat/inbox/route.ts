import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, nama: true, fotoUrl: true, role: true } },
      receiver: { select: { id: true, nama: true, fotoUrl: true, role: true } },
    },
    take: 500,
  })

  const seen = new Set<string>()
  const conversations = messages.flatMap((message) => {
    const counterpart = message.senderId === user.id ? message.receiver : message.sender
    if (!counterpart) return []
    if (seen.has(counterpart.id)) return []
    seen.add(counterpart.id)
    return [{
      user: {
        id: counterpart.id,
        nama: counterpart.nama,
        fotoUrl: counterpart.fotoUrl,
        role: counterpart.role,
      },
      lastMessage: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt?.toISOString() ?? null,
        mine: message.senderId === user.id,
      },
    }]
  })

  return NextResponse.json({ conversations })
}
