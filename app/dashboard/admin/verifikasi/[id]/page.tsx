import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import ProfileDetailClient from './ProfileDetailClient'
import { notFound } from 'next/navigation'

export default async function UserDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Ambil data profil lengkap sesuai skema tabel asatidz_profiles
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, nama, email, role, no_wa, created_at, foto_url,
      asatidz_profiles ( 
        bidang, 
        approved, 
        cv_url, 
        latar_belakang, 
        sertifikat, 
        keahlian, 
        pengalaman_mengajar,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (error || !user) {
    return notFound()
  }

  // 2. AMBIL DATA NYATA RIWAYAT: Mengambil riwayat pengajaran dari tabel materials & private_class_enrollments
  // Mengambil info kelas/materi yang diampu asatidz ini
  const { data: classMaterials } = await supabaseAdmin
    .from('materials')
    .select(`
      id,
      title,
      type,
      private_class_enrollments (
        id,
        status,
        created_at,
        profiles!private_class_enrollments_student_id_fkey ( nama )
      )
    `)
    .eq('asatidz_id', id)

  // 3. AMBIL DATA NYATA STATISTIK: Menghitung total murid unik dan total kelas privat
  const totalClasses = classMaterials?.length || 0
  
  const studentSet = new Set()
  const formattedEnrollments: any[] = []

  classMaterials?.forEach((material) => {
    const enrollments = Array.isArray(material.private_class_enrollments)
      ? material.private_class_enrollments
      : [material.private_class_enrollments].filter(Boolean)

    enrollments.forEach((enroll: any) => {
      if (enroll?.profiles?.nama) {
        studentSet.add(enroll.profiles.nama)
      }
      formattedEnrollments.push({
        id: enroll.id,
        className: material.title,
        level: material.type === 'keilmuan' ? 'Kelas Keilmuan' : 'Kajian Tematik',
        studentName: enroll.profiles?.nama || 'Hamba Allah',
        createdAt: enroll.created_at,
        status: enroll.status || 'pending'
      })
    })
  })

  // Format satu objek profil asatidz
  const asatidzData = Array.isArray(user.asatidz_profiles) 
    ? user.asatidz_profiles[0] 
    : user.asatidz_profiles

  const formattedUser = {
    ...user,
    asatidz_profiles: asatidzData ? {
      bidang: asatidzData.bidang || 'Belum ditentukan',
      approved: asatidzData.approved || false,
      cv_url: asatidzData.cv_url || null,
      latar_belakang: asatidzData.latar_belakang || 'Tidak ada data latar belakang pendidikan.',
      sertifikat: asatidzData.sertifikat || 'Tidak ada sertifikat dilampirkan.',
      keahlian: asatidzData.keahlian || 'Umum',
      pengalaman_mengajar: asatidzData.pengalaman_mengajar || 'Tidak ada data pengalaman mengajar.',
      bio: asatidzData.bio || ''
    } : null,
    stats: {
      totalClasses,
      totalStudents: studentSet.size,
      rating: 5.0 // Base rating statis karena tidak ada tabel review/rating di skema sql
    },
    enrollments: formattedEnrollments
  }

  return (
    <ProfileDetailClient user={formattedUser} />
  )
}