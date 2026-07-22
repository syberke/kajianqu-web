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
      select: { role: true, isActive: true, asatidzProfile: { select: { approved: true } } },
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

  const message = await db.message.create({
    data: { senderId: user.id, receiverId, content: content.slice(0, 5000) },
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
