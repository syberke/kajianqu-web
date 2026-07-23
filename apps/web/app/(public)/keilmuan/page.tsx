import { db } from '@/lib/db'
import MateriClient from './MateriClient'

export const dynamic = 'force-dynamic'

export default async function MateriPage({ searchParams }: { searchParams: Promise<{ topik?: string }> }) {
  const { topik } = await searchParams
  const [materials, categories] = await Promise.all([
    db.material.findMany({
      where: { isPublished: true, reviewStatus: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: {
        keilmuan: { select: { id: true, nama: true } },
        asatidz: { select: { nama: true, fotoUrl: true } },
      },
    }),
    db.keilmuan.findMany({
      where: { isActive: true },
      orderBy: { nama: 'asc' },
      select: { id: true, nama: true },
    }),
  ])

  return (
    <MateriClient
      initialMaterials={materials.map((material) => ({
        id: material.id,
        title: material.title,
        slug: material.slug,
        summary: material.summary,
        description: material.description,
        youtube_url: material.youtubeUrl,
        thumbnail_url: material.thumbnailUrl,
        level: material.level,
        type: material.type,
        keilmuan: material.keilmuan,
        asatidz: material.asatidz ? { nama: material.asatidz.nama, foto_url: material.asatidz.fotoUrl } : null,
      }))}
      keilmuanList={categories}
      initialTopic={topik || ''}
    />
  )
}
