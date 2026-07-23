import { NextResponse } from 'next/server'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'
import { asatidzMaterialSchema } from '@/lib/validation/material'

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
      description: material.description,
      youtubeUrl: material.youtubeUrl,
      durationMinutes: material.durationMinutes,
      referencesText: material.referencesText,
      keilmuanId: material.keilmuanId,
      isPublished: material.isPublished,
      workflowStatus: material.workflowStatus,
      reviewNote: material.reviewNote,
      createdAt: material.createdAt.toISOString(),
      keilmuan: material.keilmuan,
    },
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const current = await db.material.findFirst({
    where: { id, asatidzId: user.id },
    select: { id: true, workflowStatus: true },
  })
  if (!current) return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 })
  if (!['DRAFT', 'REVISION_REQUIRED', 'REJECTED'].includes(current.workflowStatus)) {
    return NextResponse.json({ error: 'Materi yang sedang direview atau sudah terbit tidak dapat diubah.' }, { status: 409 })
  }

  const parsed = asatidzMaterialSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Materi belum lengkap atau formatnya tidak valid.', fields: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const payload = parsed.data
  if (payload.keilmuanId && !(await db.keilmuan.findUnique({ where: { id: payload.keilmuanId }, select: { id: true } }))) {
    return NextResponse.json({ error: 'Bidang keilmuan tidak ditemukan.' }, { status: 400 })
  }

  const material = await db.material.update({
    where: { id: current.id },
    data: {
      title: payload.title,
      summary: payload.summary?.trim() || null,
      description: payload.description?.trim() || null,
      youtubeUrl: payload.youtubeUrl?.trim() || null,
      durationMinutes: payload.youtubeUrl ? payload.durationMinutes : null,
      referencesText: payload.referencesText?.trim() || null,
      type: payload.type,
      keilmuanId: payload.keilmuanId || null,
      isPublished: false,
      reviewStatus: 'pending',
      reviewNote: payload.submitForReview ? null : undefined,
      workflowStatus: payload.submitForReview ? 'SUBMITTED' : 'DRAFT',
    },
  })
  return NextResponse.json({ material: { id: material.id, workflowStatus: material.workflowStatus } })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, asatidzId: user.id },
    select: { id: true, workflowStatus: true },
  })

  if (!material) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 })
  }
  if (!['DRAFT', 'REJECTED'].includes(material.workflowStatus)) {
    return NextResponse.json({ error: 'Hanya draft atau materi yang ditolak yang dapat dihapus.' }, { status: 409 })
  }

  await db.material.delete({ where: { id: material.id } })
  return NextResponse.json({ success: true })
}
