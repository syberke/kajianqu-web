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
  eventUrl: string
  provider: string
  passcode: string | null
  startsAt: Date
  status: string
  asatidz: { nama: string; fotoUrl: string | null } | null
}) {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    youtube_url: session.provider === 'youtube' ? session.eventUrl : null,
    stream_url: session.eventUrl,
    provider: session.provider,
    passcode: session.passcode,
    starts_at: session.startsAt.toISOString(),
    status: session.status,
    asatidz: session.asatidz
      ? { nama: session.asatidz.nama, foto_url: session.asatidz.fotoUrl }
      : null,
  }
}

export default async function LiveClassDetailPage({ params }: Props) {
  const { id } = await params
  const [session, related] = await Promise.all([
    db.liveEvent.findFirst({
      where: { id, visibility: 'public' },
    }),
    db.liveEvent.findMany({
      where: { id: { not: id }, visibility: 'public', status: { in: ['live', 'scheduled'] } },
      orderBy: { startsAt: 'asc' },
      take: 6,
    }),
  ])

  if (!session) notFound()
  const ownerIds = [...new Set([session.asatidzId, ...related.map((item) => item.asatidzId)].filter((value): value is string => Boolean(value)))]
  const owners = ownerIds.length
    ? await db.profile.findMany({ where: { id: { in: ownerIds } }, select: { id: true, nama: true, fotoUrl: true } })
    : []
  const ownerMap = new Map(owners.map((owner) => [owner.id, owner]))
  const withOwner = <T extends typeof session>(item: T) => ({
    ...item,
    asatidz: item.asatidzId ? ownerMap.get(item.asatidzId) ?? null : null,
  })

  return (
    <KelasDetailClient
      item={mapLiveSession(withOwner(session))}
      type="live"
      relatedItems={related.map((item) => mapLiveSession(withOwner(item)))}
    />
  )
}
