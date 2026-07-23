import { NextResponse } from 'next/server'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, asatidzId: user.id },
    include: {
      keilmuan: { select: { nama: true } },
    },
  })

  if (!material) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({
    material: {
      id: material.id,
      title: material.title,
      slug: material.slug,
      summary: material.summary,
      type: material.type,
      isPublished: material.isPublished,
      createdAt: material.createdAt.toISOString(),
      keilmuan: material.keilmuan,
    },
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, asatidzId: user.id },
    select: { id: true },
  })

  if (!material) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 })
  }

  await db.material.delete({ where: { id: material.id } })
  return NextResponse.json({ success: true })
}
