import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function GET() {
  const [liveSessions, privateClasses, donationProducts] = await Promise.all([
    db.liveSession.findMany({
      where: { status: { in: ['live', 'upcoming'] } },
      orderBy: { scheduledAt: 'asc' },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.privateClassPage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { asatidz: { select: { nama: true, fotoUrl: true } } },
    }),
    db.donationProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    liveSessions: liveSessions.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      youtube_url: item.youtubeUrl,
      stream_url: item.streamUrl,
      status: item.status,
      scheduled_at: item.scheduledAt?.toISOString() ?? null,
      asatidz: item.asatidz ? { nama: item.asatidz.nama, foto_url: item.asatidz.fotoUrl } : null,
    })),
    privateClasses: privateClasses.map((item) => ({
      id: item.id,
      title: item.title,
      zoom_link: item.zoomLink,
      passcode: item.passcode,
      created_at: item.createdAt.toISOString(),
      asatidz: item.asatidz ? { nama: item.asatidz.nama, foto_url: item.asatidz.fotoUrl } : null,
    })),
    donationProducts: donationProducts.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price.toNumber(),
      image: item.image,
    })),
  })
}
