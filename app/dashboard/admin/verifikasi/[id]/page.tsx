import { notFound } from 'next/navigation'

import ProfileDetailClient from './ProfileDetailClient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole('admin')

  const profile = await db.profile.findUnique({
    where: { id },
    include: {
      asatidzProfile: true,
      materials: {
        select: {
          id: true,
          title: true,
          type: true,
          enrollments: {
            include: { student: { select: { id: true, nama: true } } },
          },
        },
      },
    },
  })

  if (!profile || profile.role !== 'asatidz') notFound()

  const studentIds = new Set<string>()
  const enrollments = profile.materials.flatMap((material) =>
    material.enrollments.map((enrollment) => {
      studentIds.add(enrollment.studentId)
      return {
        id: enrollment.id,
        className: material.title,
        level: material.type === 'keilmuan' ? 'Kelas Keilmuan' : 'Kajian Tematik',
        studentName: enrollment.student.nama || 'Santri KajianQu',
        createdAt: enrollment.createdAt.toISOString(),
        status: enrollment.status || 'pending',
      }
    }),
  )

  return (
    <ProfileDetailClient
      user={{
        id: profile.id,
        nama: profile.nama || 'Asatidz KajianQu',
        email: profile.email || '',
        role: profile.role || 'asatidz',
        no_wa: profile.noWa,
        created_at: profile.createdAt.toISOString(),
        foto_url: profile.fotoUrl,
        asatidz_profiles: profile.asatidzProfile
          ? {
              bidang: profile.asatidzProfile.bidang,
              approved: profile.asatidzProfile.approved,
              cv_url: profile.asatidzProfile.cvUrl,
              latar_belakang: profile.asatidzProfile.latarBelakang,
              sertifikat: profile.asatidzProfile.sertifikat,
              keahlian: profile.asatidzProfile.keahlian,
              pengalaman_mengajar: profile.asatidzProfile.pengalamanMengajar,
              bio: profile.asatidzProfile.bio,
            }
          : null,
        stats: {
          totalClasses: profile.materials.length,
          totalStudents: studentIds.size,
          rating: null,
        },
        enrollments,
      }}
    />
  )
}
