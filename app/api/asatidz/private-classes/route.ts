import { NextResponse } from 'next/server'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

interface PrivateClassPayload {
  title?: string
  zoomLink?: string
  passcode?: string
}

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const classes = await db.privateClassPage.findMany({
    where: { asatidzId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    classes: classes.map((item) => ({
      id: item.id,
      title: item.title,
      zoomLink: item.zoomLink,
      passcode: item.passcode,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as PrivateClassPayload | null
  const title = payload?.title?.trim()
  const zoomLink = payload?.zoomLink?.trim()
  const passcode = payload?.passcode?.trim()

  if (!title || !zoomLink || !passcode) {
    return NextResponse.json({ error: 'Materi, link Zoom, dan kode wajib diisi' }, { status: 400 })
  }

  try {
    new URL(zoomLink)
  } catch {
    return NextResponse.json({ error: 'Link Zoom tidak valid' }, { status: 400 })
  }

  const item = await db.privateClassPage.create({
    data: { asatidzId: user.id, title, zoomLink, passcode, isActive: true },
  })

  return NextResponse.json({
    class: {
      id: item.id,
      title: item.title,
      zoomLink: item.zoomLink,
      passcode: item.passcode,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
    },
  }, { status: 201 })
}
