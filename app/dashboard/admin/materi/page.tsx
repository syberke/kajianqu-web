import MateriListClient from './MateriListClient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function MateriPage() {
  await requireRole('admin')

  const materials = await db.material.findMany({
    orderBy: { createdAt: 'desc' },
    include: { asatidz: { select: { nama: true } } },
  })

  const initialMateri = materials.map((material) => ({
    id: material.id,
    type: material.type,
    keilmuan_id: material.keilmuanId,
    title: material.title,
    slug: material.slug,
    description: material.description,
    summary: material.summary,
    youtube_url: material.youtubeUrl,
    thumbnail_url: material.thumbnailUrl,
    asatidz_id: material.asatidzId,
    is_published: material.isPublished,
    status: material.reviewStatus,
    review_note: material.reviewNote,
    created_at: material.createdAt.toISOString(),
    updated_at: material.updatedAt.toISOString(),
    profiles: material.asatidz ? { nama: material.asatidz.nama } : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Materi Keilmuan</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola dan review konten edukasi islami yang masuk ke platform.</p>
      </div>
      <MateriListClient initialMateri={initialMateri} />
    </div>
  )
}
