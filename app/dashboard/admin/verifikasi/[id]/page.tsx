import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import ProfileDetailClient from './ProfileDetailClient'
import { notFound } from 'next/navigation'

// 1. Definisikan params sebagai Promise
export default async function UserDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. Wajib di-await sebelum digunakan
  const { id } = await params;

  await requireRole('admin')

  // Ambil data spesifik 1 user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, nama, email, role, no_wa, created_at,
      asatidz_profiles ( bidang, approved, cv_url )
    `)
    .eq('id', id) // Gunakan id hasil await
    .single()

  // Jika user tidak ditemukan, tampilkan halaman 404 Not Found
  if (error || !user) {
    return notFound()
  }

  // Format data
  const asatidzData = Array.isArray(user.asatidz_profiles) 
    ? user.asatidz_profiles[0] 
    : user.asatidz_profiles

  const formattedUser = {
    ...user,
    asatidz_profiles: asatidzData || null
  }

  return (
    <ProfileDetailClient user={formattedUser} />
  )
}