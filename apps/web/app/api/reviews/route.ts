import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const reviewSchema = z.object({ asatidzId: z.uuid(), rating: z.number().int().min(1).max(5), content: z.string().trim().min(3).max(2_000) })

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Silakan masuk terlebih dahulu' }, { status: 401 })
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Rating dan ulasan wajib diisi' }, { status: 400 })

  const [reviewer, target] = await Promise.all([
    db.profile.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } }),
    db.profile.findFirst({ where: { id: parsed.data.asatidzId, role: 'asatidz', isActive: true, asatidzProfile: { approved: true } }, select: { id: true } }),
  ])
  if (!reviewer?.isActive || reviewer.role !== 'siswa') return NextResponse.json({ error: 'Hanya akun siswa aktif yang dapat memberi ulasan' }, { status: 403 })
  if (!target) return NextResponse.json({ error: 'Ustadz tidak ditemukan' }, { status: 404 })

  const review = await db.review.upsert({
    where: { reviewerId_asatidzId: { reviewerId: user.id, asatidzId: target.id } },
    update: { rating: parsed.data.rating, content: parsed.data.content, status: 'published' },
    create: { reviewerId: user.id, asatidzId: target.id, rating: parsed.data.rating, content: parsed.data.content },
  })
  return NextResponse.json({ review }, { status: 201 })
}
