import { notFound } from 'next/navigation'

import DetailMateriClient from './detailmatericlient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function DetailMateriPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin')
  const { id } = await params

  const material = await db.material.findUnique({
    where: { id },
    include: {
      asatidz: { select: { nama: true, email: true } },
      keilmuan: { select: { nama: true } },
    },
  })

  if (!material) notFound()

  return (
    <DetailMateriClient
      materi={{
        id: material.id,
        type: material.type,
        keilmuan_id: material.keilmuanId,
        title: material.title,
        slug: material.slug,
        description: material.description,
        summary: material.summary,
        youtube_url: material.youtubeUrl,
        duration_minutes: material.durationMinutes,
        references_text: material.referencesText,
        workflow_status: material.workflowStatus,
        thumbnail_url: material.thumbnailUrl,
        asatidz_id: material.asatidzId,
        is_published: material.isPublished,
        status: material.reviewStatus,
        review_note: material.reviewNote,
        created_at: material.createdAt.toISOString(),
        updated_at: material.updatedAt.toISOString(),
        profiles: material.asatidz
          ? { nama: material.asatidz.nama, email: material.asatidz.email }
          : null,
        kategori_nama: material.keilmuan?.nama || 'Kajian Umum',
        judul: material.title,
        deskripsi: material.description || material.summary,
      }}
    />
  )
}
