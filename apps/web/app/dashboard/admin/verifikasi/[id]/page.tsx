import { notFound } from 'next/navigation'

import ProfileDetailClient from './ProfileDetailClient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole('admin')

  const profile = await db.profile.findUnique({
    where: { id },
    include: {
      asatidzProfile: {
        include: {
          documents: { orderBy: { uploadedAt: 'desc' } },
          expertise: { include: { tag: true } },
        },
      },
      privateClassPages: {
        select: {
          id: true,
          title: true,
          enrollments: {
            include: { student: { select: { id: true, nama: true } } },
          },
        },
      },
    },
  })

  if (!profile || profile.role !== 'asatidz') notFound()

  const storage = createAdminClient().storage.from('asatidz-private')
  const documents = await Promise.all((profile.asatidzProfile?.documents ?? []).map(async (document) => {
    const { data } = await storage.createSignedUrl(document.storagePath, 60 * 10)
    return {
      id: document.id,
      type: document.documentType,
      status: document.status,
      sizeBytes: Number(document.sizeBytes),
      uploadedAt: document.uploadedAt.toISOString(),
      url: data?.signedUrl ?? null,
    }
  }))

  const studentIds = new Set<string>()
  const enrollments = profile.privateClassPages.flatMap((classPage) =>
    classPage.enrollments.map((enrollment) => {
      studentIds.add(enrollment.studentId)
      return {
        id: enrollment.id,
        className: classPage.title,
        level: 'Kelas Private',
        studentName: enrollment.student.nama,
        createdAt: enrollment.createdAt?.toISOString() ?? '',
        status: enrollment.status,
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
              status: profile.asatidzProfile.status,
              asatidz_code: profile.asatidzProfile.asatidzCode,
              title: profile.asatidzProfile.title,
              formal_education: profile.asatidzProfile.formalEducation,
              nonformal_education: profile.asatidzProfile.nonformalEducation,
              memorization_juz: profile.asatidzProfile.memorizationJuz ? Number(profile.asatidzProfile.memorizationJuz) : null,
              sanad_history: profile.asatidzProfile.sanadHistory,
              bank: profile.asatidzProfile.bank,
              bank_account_type: profile.asatidzProfile.bankAccountType,
              bank_account_name: profile.asatidzProfile.bankAccountName,
              no_rekening: profile.asatidzProfile.noRekening,
              teaching_area: profile.asatidzProfile.teachingArea,
              review_note: profile.asatidzProfile.reviewNote,
              submitted_at: profile.asatidzProfile.submittedAt?.toISOString() ?? null,
              cv_url: profile.asatidzProfile.cvUrl,
              latar_belakang: profile.asatidzProfile.latarBelakang,
              sertifikat: profile.asatidzProfile.sertifikat,
              keahlian: profile.asatidzProfile.keahlian,
              pengalaman_mengajar: profile.asatidzProfile.pengalamanMengajar,
              bio: profile.asatidzProfile.bio,
              expertise: profile.asatidzProfile.expertise.map((item) => ({
                id: item.tag.id,
                name: item.tag.name,
              })),
              documents,
            }
          : null,
        stats: {
          totalClasses: profile.privateClassPages.length,
          totalStudents: studentIds.size,
          rating: null,
        },
        enrollments,
      }}
    />
  )
}
