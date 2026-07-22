import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Silakan masuk untuk mendaftar kelas.' }, { status: 401 })

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true },
  })
  if (!profile?.isActive || profile.role !== 'siswa') {
    return NextResponse.json({ error: 'Pendaftaran kelas hanya tersedia untuk akun siswa aktif.' }, { status: 403 })
  }

  const { id } = await params
  const classPage = await db.privateClassPage.findFirst({
    where: { id, isActive: true, asatidz: { isActive: true, asatidzProfile: { approved: true } } },
    select: { id: true },
  })
  if (!classPage) return NextResponse.json({ error: 'Kelas tidak tersedia.' }, { status: 404 })

  const enrollment = await db.privateClassEnrollment.upsert({
    where: { classId_studentId: { classId: id, studentId: user.id } },
    create: { classId: id, studentId: user.id, status: 'pending' },
    update: {},
  })

  return NextResponse.json({
    id: enrollment.id,
    status: enrollment.status,
    message: enrollment.status === 'approved' ? 'Anda sudah terdaftar di kelas ini.' : 'Pendaftaran berhasil dan menunggu persetujuan Asatidz.',
  })
}
