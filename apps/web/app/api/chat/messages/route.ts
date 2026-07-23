import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { canMessage } from '@/lib/auth/can-message'
import { db } from '@/lib/db'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

const messageSchema = z.object({
  receiverId: z.uuid(),
  content: z.string().trim().min(1).max(5_000),
})

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(`message:${requestIdentity(request, user.id)}`, 30, 60_000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Pesan dikirim terlalu cepat. Coba lagi sebentar.' }, {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Penerima dan pesan wajib diisi' }, { status: 400 })
  }
  const { receiverId, content } = parsed.data
  if (receiverId === user.id) {
    return NextResponse.json({ error: 'Tidak dapat mengirim pesan ke diri sendiri' }, { status: 400 })
  }

  const [sender, receiver] = await Promise.all([
    db.profile.findUnique({
      where: { id: user.id },
      select: { nama: true, role: true, isActive: true, asatidzProfile: { select: { approved: true } } },
    }),
    db.profile.findUnique({
      where: { id: receiverId },
      select: { id: true, role: true, isActive: true, asatidzProfile: { select: { approved: true } } },
    }),
  ])
  if (!receiver) return NextResponse.json({ error: 'Penerima tidak ditemukan' }, { status: 404 })
  if (!sender || !canMessage(
    { role: sender.role, isActive: sender.isActive, asatidzApproved: sender.asatidzProfile?.approved },
    { role: receiver.role, isActive: receiver.isActive, asatidzApproved: receiver.asatidzProfile?.approved },
  )) {
    return NextResponse.json({ error: 'Anda tidak memiliki akses untuk percakapan ini' }, { status: 403 })
  }

  const studentId = sender.role === 'siswa' ? user.id : receiverId
  const asatidzId = sender.role === 'asatidz' ? user.id : receiverId
  const receiverChatUrl = receiver.role === 'asatidz'
    ? `/dashboard/asatidz/chat?user=${user.id}`
    : `/dashboard/siswa/chat?ustadz=${user.id}`

  const existingConversation = sender.role === 'asatidz'
    ? await db.conversation.findUnique({ where: { studentId_asatidzId: { studentId, asatidzId } }, select: { id: true } })
    : null
  if (sender.role === 'asatidz' && !existingConversation) {
    return NextResponse.json({ error: 'Siswa harus memulai percakapan terlebih dahulu' }, { status: 403 })
  }

  const message = await db.$transaction(async (transaction) => {
    const conversation = sender.role === 'siswa'
      ? await transaction.conversation.upsert({
          where: { studentId_asatidzId: { studentId, asatidzId } },
          update: { updatedAt: new Date() },
          create: { studentId, asatidzId },
        })
      : await transaction.conversation.update({
          where: { id: existingConversation!.id },
          data: { updatedAt: new Date() },
        })
    const created = await transaction.message.create({
      data: {
        senderId: user.id,
        receiverId,
        conversationId: conversation.id,
        content: content.slice(0, 5000),
      },
    })
    await transaction.notification.create({
      data: {
        recipientId: receiverId,
        type: 'chat',
        title: 'Pesan baru',
        message: `Anda menerima pesan baru dari ${sender.nama || 'pengguna KajianQu'}.`,
        actionUrl: receiverChatUrl,
      },
    })
    return created
  })

  return NextResponse.json({
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
      mine: true,
    },
  }, { status: 201 })
}
