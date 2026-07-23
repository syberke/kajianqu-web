import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

const privateClassSchema = z.object({
  title: z.string().trim().min(3).max(160),
  zoomLink: z.url().max(500),
  passcode: z.string().trim().min(4).max(40),
})

const enrollmentSchema = z.object({
  enrollmentId: z.uuid(),
  status: z.enum(['approved', 'rejected']),
})

export async function GET() {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const classes = await db.privateClassPage.findMany({
    where: { asatidzId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      enrollments: {
        orderBy: { createdAt: 'desc' },
        include: { student: { select: { nama: true, email: true } } },
      },
    },
  })

  return NextResponse.json({
    classes: classes.map((item) => ({
      id: item.id,
      title: item.title,
      zoomLink: item.zoomLink,
      passcode: item.passcode,
      isActive: item.isActive,
      createdAt: item.createdAt?.toISOString() ?? null,
      enrollments: item.enrollments.map((enrollment) => ({
        id: enrollment.id,
        status: enrollment.status,
        studentName: enrollment.student.nama,
        studentEmail: enrollment.student.email,
      })),
    })),
  })
}

export async function POST(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = privateClassSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Materi, link Zoom, dan kode wajib diisi' }, { status: 400 })
  }
  const { title, zoomLink, passcode } = parsed.data

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
      createdAt: item.createdAt?.toISOString() ?? null,
      enrollments: [],
    },
  }, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await requireAsatidz()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data persetujuan tidak valid.' }, { status: 400 })

  const enrollment = await db.privateClassEnrollment.findFirst({
    where: { id: parsed.data.enrollmentId, class: { asatidzId: user.id } },
    select: { id: true },
  })
  if (!enrollment) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 })

  const updated = await db.privateClassEnrollment.update({
    where: { id: enrollment.id },
    data: { status: parsed.data.status },
  })
  return NextResponse.json({ id: updated.id, status: updated.status })
}
