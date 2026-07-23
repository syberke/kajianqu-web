import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, isPublished: true, reviewStatus: 'approved' },
    include: {
      keilmuan: { select: { id: true, nama: true } },
      asatidz: { select: { nama: true, fotoUrl: true } },
    },
  })
  if (!material) return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 })

  return NextResponse.json({
    material: {
      id: material.id,
      title: material.title,
      slug: material.slug,
      summary: material.summary,
      description: material.description,
      youtube_url: material.youtubeUrl,
      thumbnail_url: material.thumbnailUrl,
      level: material.level,
      type: material.type,
      created_at: material.createdAt.toISOString(),
      keilmuan: material.keilmuan,
      asatidz: material.asatidz ? { nama: material.asatidz.nama, foto_url: material.asatidz.fotoUrl } : null,
    },
  })
}
