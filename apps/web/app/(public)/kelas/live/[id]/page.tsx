import { notFound } from 'next/navigation'

import { db } from '@/lib/db'
import KelasDetailClient from './KelasDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

function mapLiveSession(session: {
  id: string
  title: string
  description: string | null
  youtubeUrl: string | null
  streamUrl: string | null
  status: string | null
  asatidz: { nama: string | null; fotoUrl: string | null } | null
}) {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    youtube_url: session.youtubeUrl,
    stream_url: session.streamUrl,
    status: session.status,
    asatidz: session.asatidz
      ? { nama: session.asatidz.nama, foto_url: session.asatidz.fotoUrl }
      : null,
  }
}

export default async function LiveClassDetailPage({ params }: Props) {
  const { id } = await params
  const [session, related] = await Promise.all([
    db.liveSession.findUnique({
      where: { id },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.liveSession.findMany({
      where: { id: { not: id }, status: { in: ['live', 'upcoming'] } },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 6,
    }),
  ])

  if (!session) notFound()

  return (
    <KelasDetailClient
      item={mapLiveSession(session)}
      type="live"
      relatedItems={related.map(mapLiveSession)}
    />
  )
}
