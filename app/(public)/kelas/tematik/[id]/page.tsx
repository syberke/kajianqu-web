import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import KelasDetailClient from './KelasDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

function mapMaterial(material: {
  id: string
  title: string
  description: string | null
  summary: string | null
  youtubeUrl: string | null
  asatidz: { nama: string | null; fotoUrl: string | null } | null
}) {
  return {
    id: material.id,
    title: material.title,
    description: material.description ?? material.summary,
    youtube_url: material.youtubeUrl,
    stream_url: null,
    asatidz: material.asatidz
      ? { nama: material.asatidz.nama, foto_url: material.asatidz.fotoUrl }
      : null,
  }
}

export default async function TematikDetailPage({ params }: Props) {
  const { id } = await params
  const [material, related] = await Promise.all([
    db.material.findFirst({
      where: { id, type: 'kajian_tematik', isPublished: true },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.material.findMany({
      where: { type: 'kajian_tematik', isPublished: true, id: { not: id } },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  if (!material) notFound()

  return (
    <KelasDetailClient
      item={mapMaterial(material)}
      type="tematik"
      relatedItems={related.map(mapMaterial)}
    />
  )
}
