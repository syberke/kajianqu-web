'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Gunakan Supabase Admin Client (Bypass RLS & Cookie)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. FUNGSI TOGGLE VERIFIKASI (Bisa Approve & Unapprove)
export async function toggleVerifikasiAsatidz(userId: string, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('asatidz_profiles')
    .update({ approved: !currentStatus }) // Membalikkan status (true jadi false, dst)
    .eq('id', userId)

  if (error) {
    console.error('Gagal ubah status asatidz:', error)
    return { error: 'Gagal mengubah status verifikasi Asatidz' }
  }

  revalidatePath('/dashboard/admin/verifikasi')
  return { success: true }
}

// 2. FUNGSI UPDATE DATA USER
// 2. FUNGSI UPDATE DATA & ROLE USER
export async function updateUser(userId: string, nama: string, no_wa: string, role: string) {
  // LANGKAH 1: Update Auth Metadata (Ini SANGAT PENTING agar Middleware / RLS Next.js tahu rolenya berubah)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role: role }
  })

  if (authError) {
    console.error('Auth update error:', authError)
    return { error: 'Gagal mengupdate hak akses sistem' }
  }

  // LANGKAH 2: Update data di tabel profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ nama, no_wa, role })
    .eq('id', userId)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return { error: 'Gagal update data profil' }
  }

  revalidatePath('/dashboard/admin/verifikasi')
  return { success: true }
}

// 3. FUNGSI HAPUS USER (Mencabut akses ke aplikasi sepenuhnya)
export async function hapusUser(userId: string) {
  // Menghapus dari auth.users otomatis akan menghapus datanya di tabel profiles 
  // (jika kamu setting CASCADE di database) atau memblokir loginnya.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) return { error: `Gagal menghapus: ${error.message}` }

  revalidatePath('/dashboard/admin/verifikasi')
  return { success: true }
}