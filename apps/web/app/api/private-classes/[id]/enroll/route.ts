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
  const classPage = await db.privateClass.findFirst({
    where: { id, registrationStatus: 'open' },
    select: { id: true, capacity: true },
  })
  if (!classPage) return NextResponse.json({ error: 'Kelas tidak tersedia.' }, { status: 404 })

  const activeCount = await db.classMember.count({ where: { classId: id, status: 'active' } })
  if (activeCount >= classPage.capacity) return NextResponse.json({ error: 'Kapasitas kelas sudah penuh.' }, { status: 409 })

  const enrollment = await db.classMember.upsert({
    where: { classId_userId: { classId: id, userId: user.id } },
    create: { classId: id, userId: user.id, status: 'pending' },
    update: {},
  })

  return NextResponse.json({
    classId: enrollment.classId,
    status: enrollment.status,
    message: enrollment.status === 'active' ? 'Anda sudah terdaftar di kelas ini.' : 'Pendaftaran berhasil dan menunggu persetujuan Asatidz.',
  })
}
