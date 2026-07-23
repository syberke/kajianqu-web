import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const savedSchema = z.object({ targetType: z.enum(['asatidz', 'privateClass', 'material']), targetId: z.uuid() })

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu' }, { status: 401 })
  const parsed = savedSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Item tidak valid' }, { status: 400 })

  const { targetType, targetId } = parsed.data
  const targetWhere = targetType === 'asatidz' ? { asatidzId: targetId } : targetType === 'privateClass' ? { privateClassId: targetId } : { materialId: targetId }
  const targetExists = targetType === 'asatidz'
    ? await db.profile.count({ where: { id: targetId, role: 'asatidz', isActive: true, asatidzProfile: { approved: true } } })
    : targetType === 'privateClass'
      ? await db.privateClassPage.count({ where: { id: targetId, isActive: true } })
      : await db.material.count({ where: { id: targetId, isPublished: true, reviewStatus: 'approved' } })
  if (!targetExists) return NextResponse.json({ error: 'Item tidak ditemukan atau tidak tersedia' }, { status: 404 })

  const existing = await db.savedItem.findFirst({ where: { userId: user.id, ...targetWhere }, select: { id: true } })
  if (existing) {
    await db.savedItem.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false })
  }
  await db.savedItem.create({ data: { userId: user.id, ...targetWhere } })
  return NextResponse.json({ saved: true }, { status: 201 })
}
