import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ studentId: user.id }, { asatidzId: user.id }],
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      student: { select: { id: true, nama: true, fotoUrl: true, role: true } },
      asatidz: { select: { id: true, nama: true, fotoUrl: true, role: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: { where: { receiverId: user.id, isRead: false } } } },
    },
    take: 100,
  })

  return NextResponse.json({
    conversations: conversations.map((conversation) => {
      const counterpart = conversation.studentId === user.id ? conversation.asatidz : conversation.student
      const lastMessage = conversation.messages[0]
      return {
      user: {
        id: counterpart.id,
        nama: counterpart.nama,
        fotoUrl: counterpart.fotoUrl,
        role: counterpart.role,
      },
      lastMessage: {
        id: lastMessage?.id ?? conversation.id,
        content: lastMessage?.content ?? 'Percakapan baru',
        createdAt: lastMessage?.createdAt?.toISOString() ?? conversation.createdAt.toISOString(),
        mine: lastMessage?.senderId === user.id,
      },
      unreadCount: conversation._count.messages,
    }
    }),
    unreadTotal: conversations.reduce((total, conversation) => total + conversation._count.messages, 0),
  })
}
