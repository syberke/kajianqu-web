import { db } from '@/lib/db'
import KelasClient from './KelasClient'

export default async function KelasPage() {
  const [liveSessions, tematik, mentors, privateCount] = await Promise.all([
    db.liveSession.findMany({
      where: { status: { in: ['live', 'upcoming', 'ended'] } },
      orderBy: { scheduledAt: 'desc' },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.material.findMany({
      where: { type: 'kajian_tematik', isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.profile.findMany({
      where: { role: 'asatidz', asatidzProfile: { approved: true } },
      orderBy: { nama: 'asc' },
      take: 12,
      include: { asatidzProfile: { select: { bidang: true } } },
    }),
    db.privateClassPage.count({ where: { isActive: true } }),
  ])

  return (
    <KelasClient
      liveData={liveSessions.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        youtube_url: item.youtubeUrl,
        stream_url: item.streamUrl,
        status: item.status,
        scheduled_at: item.scheduledAt?.toISOString() ?? null,
        asatidz: item.asatidz ? { nama: item.asatidz.nama, foto_url: item.asatidz.fotoUrl } : null,
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
        activeClassCount: privateCount,
        mentors: mentors.map((item) => ({
          nama: item.nama ?? 'Asatidz KajianQu',
          bidang: item.asatidzProfile?.bidang ?? 'Keilmuan Islam',
          fotoUrl: item.fotoUrl,
        })),
      }}
    />
  )
}
