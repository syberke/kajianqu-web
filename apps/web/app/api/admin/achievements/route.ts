import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const createSchema = z.object({
  action: z.literal('create'),
  code: z.string().trim().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(3).max(500),
  icon: z.string().trim().max(40).optional(),
  targetRole: z.enum(['admin', 'siswa', 'asatidz']).nullable().optional(),
})

const awardSchema = z.object({
  action: z.literal('award'),
  userId: z.uuid(),
  achievementId: z.uuid(),
  evidence: z.string().trim().max(500).optional(),
})

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [achievements, users] = await Promise.all([
    db.achievement.findMany({
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
      include: { awards: { orderBy: { awardedAt: 'desc' }, include: { user: { select: { id: true, nama: true, role: true } } } } },
    }),
    db.profile.findMany({
      where: { isActive: true, role: { in: ['admin', 'siswa', 'asatidz'] } },
      orderBy: { nama: 'asc' },
      select: { id: true, nama: true, role: true },
      take: 500,
    }),
  ])
  return NextResponse.json({ achievements, users })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)

  const create = createSchema.safeParse(body)
  if (create.success) {
    const item = await db.achievement.create({
      data: {
        code: create.data.code.toUpperCase(),
        title: create.data.title,
        description: create.data.description,
        icon: create.data.icon || null,
        targetRole: create.data.targetRole || null,
      },
    })
    return NextResponse.json({ achievement: item }, { status: 201 })
  }

  const award = awardSchema.safeParse(body)
  if (!award.success) return NextResponse.json({ error: 'Data achievement tidak valid.' }, { status: 400 })
  const [user, achievement] = await Promise.all([
    db.profile.findUnique({ where: { id: award.data.userId }, select: { id: true, role: true, isActive: true } }),
    db.achievement.findUnique({ where: { id: award.data.achievementId } }),
  ])
  if (!user?.isActive || !achievement?.isActive) return NextResponse.json({ error: 'Pengguna atau achievement tidak tersedia.' }, { status: 404 })
  if (achievement.targetRole && achievement.targetRole !== user.role) {
    return NextResponse.json({ error: `Achievement ini hanya untuk role ${achievement.targetRole}.` }, { status: 409 })
  }
  await db.$transaction([
    db.userAchievement.upsert({
      where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
      update: { awardedBy: admin.id, awardedAt: new Date(), evidence: { note: award.data.evidence || '' } },
      create: { userId: user.id, achievementId: achievement.id, awardedBy: admin.id, evidence: { note: award.data.evidence || '' } },
    }),
    db.notification.create({
      data: {
        recipientId: user.id,
        type: 'achievement',
        title: 'Achievement baru',
        message: `Selamat, Anda mendapatkan achievement "${achievement.title}".`,
        actionUrl: '/achievement',
      },
    }),
  ])
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = z.object({ userId: z.uuid(), achievementId: z.uuid() }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 })
  await db.userAchievement.deleteMany({ where: parsed.data })
  return NextResponse.json({ success: true })
}
