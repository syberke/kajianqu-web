import { db } from '@/lib/db'
import KelasClient from './KelasClient'

export const dynamic = 'force-dynamic'

export default async function KelasPage() {
  const [liveSessions, tematik, mentors, privateClasses] = await Promise.all([
    db.liveEvent.findMany({
      where: { status: { in: ['live', 'scheduled', 'ended'] }, visibility: 'public' },
      orderBy: { startsAt: 'desc' },
    }),
    db.material.findMany({
      where: { type: 'kajian_tematik', isPublished: true, reviewStatus: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.profile.findMany({
      where: { role: 'asatidz', asatidzProfile: { approved: true } },
      orderBy: { nama: 'asc' },
      take: 12,
      include: { asatidzProfile: { select: { bidang: true } } },
    }),
    db.privateClass.findMany({
      where: { registrationStatus: { in: ['open', 'ongoing'] } },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  const asatidzIds = [...new Set([
    ...liveSessions.map((item) => item.asatidzId).filter((value): value is string => Boolean(value)),
    ...privateClasses.map((item) => item.asatidzId),
  ])]
  const owners = asatidzIds.length
    ? await db.profile.findMany({ where: { id: { in: asatidzIds } }, select: { id: true, nama: true, fotoUrl: true } })
    : []
  const ownerMap = new Map(owners.map((owner) => [owner.id, owner]))

  return (
    <KelasClient
      liveData={liveSessions.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        youtube_url: item.provider === 'youtube' ? item.eventUrl : null,
        stream_url: item.eventUrl,
        status: item.status,
        scheduled_at: item.startsAt.toISOString(),
        asatidz: item.asatidzId && ownerMap.get(item.asatidzId) ? { nama: ownerMap.get(item.asatidzId)!.nama, foto_url: ownerMap.get(item.asatidzId)!.fotoUrl } : null,
      }))}
      tematikData={tematik.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? item.summary,
        youtube_url: item.youtubeUrl,
        status: null,
        asatidz: item.asatidz ? { nama: item.asatidz.nama, foto_url: item.asatidz.fotoUrl } : null,
      }))}
      privateData={{
        activeClassCount: privateClasses.length,
        classes: privateClasses.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          coverUrl: item.coverPath,
          startsAt: item.startsAt?.toISOString() ?? null,
          capacity: item.capacity,
          price: Number(item.price),
          asatidz: ownerMap.get(item.asatidzId) ? { nama: ownerMap.get(item.asatidzId)!.nama, fotoUrl: ownerMap.get(item.asatidzId)!.fotoUrl } : null,
        })),
        mentors: mentors.map((item) => ({
          nama: item.nama ?? 'Asatidz KajianQu',
          bidang: item.asatidzProfile?.bidang ?? 'Keilmuan Islam',
          fotoUrl: item.fotoUrl,
        })),
      }}
    />
  )
}
