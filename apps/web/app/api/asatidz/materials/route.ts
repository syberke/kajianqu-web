import { NextResponse } from 'next/server'
import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'
import { asatidzMaterialSchema, materialSlug } from '@/lib/validation/material'

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
      workflowStatus: material.workflowStatus,
      reviewNote: material.reviewNote,
      youtubeUrl: material.youtubeUrl,
      durationMinutes: material.durationMinutes,
      createdAt: material.createdAt.toISOString(),
      keilmuan: material.keilmuan,
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = asatidzMaterialSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Materi belum lengkap atau formatnya tidak valid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  const payload = parsed.data

  if (payload.keilmuanId) {
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
      title: payload.title,
      slug: `${materialSlug(payload.title) || 'materi'}-${Date.now().toString(36)}`,
      summary: payload.summary?.trim() || null,
      description: payload.description?.trim() || null,
      youtubeUrl: payload.youtubeUrl?.trim() || null,
      durationMinutes: payload.youtubeUrl ? payload.durationMinutes : null,
      referencesText: payload.referencesText?.trim() || null,
      type: payload.type,
      keilmuanId: payload.keilmuanId || null,
      asatidzId: user.id,
      isPublished: false,
      reviewStatus: 'pending',
      workflowStatus: payload.submitForReview ? 'SUBMITTED' : 'DRAFT',
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
        workflowStatus: material.workflowStatus,
        reviewNote: material.reviewNote,
        youtubeUrl: material.youtubeUrl,
        durationMinutes: material.durationMinutes,
        createdAt: material.createdAt.toISOString(),
        keilmuan: material.keilmuan,
      },
    },
    { status: 201 },
  )
}
