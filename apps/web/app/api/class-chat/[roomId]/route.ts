import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

interface Context {
  params: Promise<{ roomId: string }>
}

async function membership(roomId: string, userId: string) {
  return db.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  })
}

export async function GET(_request: Request, { params }: Context) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { roomId } = await params
  if (!z.uuid().safeParse(roomId).success) return NextResponse.json({ error: 'Ruang chat tidak valid.' }, { status: 400 })

  const member = await membership(roomId, user.id)
  if (!member || member.blockedAt) return NextResponse.json({ error: 'Anda bukan anggota aktif ruang ini.' }, { status: 403 })

  const [room, messages] = await Promise.all([
    db.chatRoom.findUnique({ where: { id: roomId } }),
    db.chatMessage.findMany({
      where: { roomId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }),
  ])
  if (!room) return NextResponse.json({ error: 'Ruang chat tidak ditemukan.' }, { status: 404 })

  const senderIds = [...new Set(messages.map((message) => message.senderId))]
  const senders = senderIds.length
    ? await db.profile.findMany({ where: { id: { in: senderIds } }, select: { id: true, nama: true, fotoUrl: true, role: true } })
    : []
  const senderMap = new Map(senders.map((sender) => [sender.id, sender]))

  if (!member.lastReadAt || Date.now() - member.lastReadAt.getTime() > 30_000) {
    await db.chatRoomMember.update({
      where: { roomId_userId: { roomId, userId: user.id } },
      data: { lastReadAt: new Date() },
    })
  }

  return NextResponse.json({
    room: { id: room.id, title: room.title || 'Chat Kelas', classId: room.classId },
    currentUserId: user.id,
    canModerate: ['owner', 'moderator'].includes(member.memberRole),
    messages: messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      senderName: senderMap.get(message.senderId)?.nama ?? 'Anggota KajianQu',
      senderRole: senderMap.get(message.senderId)?.role ?? 'siswa',
      content: message.content,
      isPinned: message.isPinned,
      createdAt: message.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request, { params }: Context) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { roomId } = await params
  if (!z.uuid().safeParse(roomId).success) return NextResponse.json({ error: 'Ruang chat tidak valid.' }, { status: 400 })

  const member = await membership(roomId, user.id)
  if (!member || member.blockedAt || (member.mutedUntil && member.mutedUntil > new Date())) {
    return NextResponse.json({ error: 'Anda tidak dapat mengirim pesan ke ruang ini.' }, { status: 403 })
  }

  const rate = checkRateLimit(`class-chat:${requestIdentity(request, user.id)}`, 60, 60_000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Pesan dikirim terlalu cepat. Tunggu sebentar.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })
  }

  const parsed = z.object({ content: z.string().trim().min(1).max(4_000) }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Pesan harus berisi 1 sampai 4.000 karakter.' }, { status: 400 })

  const message = await db.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: { roomId, senderId: user.id, content: parsed.data.content, messageType: 'text' },
    })
    await tx.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } })
    return created
  })
  return NextResponse.json({ message: { id: message.id, createdAt: message.createdAt.toISOString() } }, { status: 201 })
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { roomId } = await params
  const member = await membership(roomId, user.id)
  if (!member || !['owner', 'moderator'].includes(member.memberRole)) {
    return NextResponse.json({ error: 'Hanya pengelola kelas yang dapat menyematkan pesan.' }, { status: 403 })
  }

  const parsed = z.object({ messageId: z.uuid(), isPinned: z.boolean() }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data pesan tidak valid.' }, { status: 400 })
  const message = await db.chatMessage.findFirst({ where: { id: parsed.data.messageId, roomId }, select: { id: true } })
  if (!message) return NextResponse.json({ error: 'Pesan tidak ditemukan.' }, { status: 404 })

  await db.chatMessage.update({ where: { id: message.id }, data: { isPinned: parsed.data.isPinned } })
  return NextResponse.json({ success: true })
}
