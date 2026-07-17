import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

interface MessagePayload {
  receiverId?: string
  content?: string
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as MessagePayload | null
  const receiverId = payload?.receiverId?.trim()
  const content = payload?.content?.trim()
  if (!receiverId || !content) {
    return NextResponse.json({ error: 'Penerima dan pesan wajib diisi' }, { status: 400 })
  }
  if (receiverId === user.id) {
    return NextResponse.json({ error: 'Tidak dapat mengirim pesan ke diri sendiri' }, { status: 400 })
  }

  const receiver = await db.profile.findUnique({ where: { id: receiverId }, select: { id: true } })
  if (!receiver) return NextResponse.json({ error: 'Penerima tidak ditemukan' }, { status: 404 })

  const message = await db.message.create({
    data: { senderId: user.id, receiverId, content: content.slice(0, 5000) },
  })

  return NextResponse.json({
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      mine: true,
    },
  }, { status: 201 })
}
