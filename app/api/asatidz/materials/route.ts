import { NextResponse } from 'next/server'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

interface CreateMaterialPayload {
  title?: string
  summary?: string
  type?: string
  keilmuanId?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const materials = await db.material.findMany({
    where: { asatidzId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      keilmuan: { select: { nama: true } },
    },
  })

  return NextResponse.json({
    materials: materials.map((material) => ({
      id: material.id,
      title: material.title,
      slug: material.slug,
      summary: material.summary,
      type: material.type,
      isPublished: material.isPublished,
      createdAt: material.createdAt.toISOString(),
      keilmuan: material.keilmuan,
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as CreateMaterialPayload | null
  const title = payload?.title?.trim()
  if (!title) {
    return NextResponse.json({ error: 'Judul materi wajib diisi' }, { status: 400 })
  }

  if (payload?.keilmuanId) {
    const category = await db.keilmuan.findUnique({
      where: { id: payload.keilmuanId },
      select: { id: true },
    })
    if (!category) {
      return NextResponse.json({ error: 'Bidang keilmuan tidak ditemukan' }, { status: 400 })
    }
  }

  const material = await db.material.create({
    data: {
      title,
      slug: `${slugify(title) || 'materi'}-${Date.now().toString(36)}`,
      summary: payload?.summary?.trim() || null,
      type: payload?.type?.trim() || 'materi',
      keilmuanId: payload?.keilmuanId || null,
      asatidzId: user.id,
      isPublished: false,
    },
    include: {
      keilmuan: { select: { nama: true } },
    },
  })

  return NextResponse.json(
    {
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
    },
    { status: 201 },
  )
}
