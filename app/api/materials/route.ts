import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const categoryId = url.searchParams.get('categoryId')?.trim() ?? ''
  const type = url.searchParams.get('type')?.trim() ?? ''

  const materials = await db.material.findMany({
    where: {
      isPublished: true,
      reviewStatus: 'approved',
      ...(categoryId ? { keilmuanId: categoryId } : {}),
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { summary: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      keilmuan: { select: { id: true, nama: true } },
      asatidz: { select: { nama: true, fotoUrl: true } },
    },
  })

  return NextResponse.json({
    materials: materials.map((material) => ({
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
    })),
  })
}
