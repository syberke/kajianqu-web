import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { canMessage } from '@/lib/auth/can-message'
import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ userId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = await params
  const [currentProfile, counterpart] = await Promise.all([
    db.profile.findUnique({ where: { id: user.id }, select: { role: true, isActive: true, asatidzProfile: { select: { approved: true } } } }),
    db.profile.findUnique({ where: { id: userId }, select: { id: true, nama: true, fotoUrl: true, role: true, isActive: true, asatidzProfile: { select: { approved: true } } } }),
  ])
  if (!counterpart) return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
  if (!currentProfile || !canMessage(
    { role: currentProfile.role, isActive: currentProfile.isActive, asatidzApproved: currentProfile.asatidzProfile?.approved },
    { role: counterpart.role, isActive: counterpart.isActive, asatidzApproved: counterpart.asatidzProfile?.approved },
  )) return NextResponse.json({ error: 'Anda tidak memiliki akses untuk percakapan ini' }, { status: 403 })

  const studentId = currentProfile.role === 'siswa' ? user.id : userId
  const asatidzId = currentProfile.role === 'asatidz' ? user.id : userId
  const conversation = await db.conversation.findUnique({ where: { studentId_asatidzId: { studentId, asatidzId } } })
  const messages = conversation ? await db.$transaction(async (transaction) => {
    await transaction.message.updateMany({
      where: { conversationId: conversation.id, receiverId: user.id, isRead: false },
      data: { isRead: true },
    })
    return transaction.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 500,
    })
  }) : []

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
      createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
      mine: message.senderId === user.id,
    })),
  })
}
