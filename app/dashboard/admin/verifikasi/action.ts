'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. FUNGSI TOGGLE VERIFIKASI (Sekarang Mengubah Database Nyata)
export async function toggleVerifikasiAsatidz(userId: string, currentStatus: boolean) {
  try {
    const nextStatus = !currentStatus

    // UPDATE DATABASE NYATA: Ubah status approved di tabel asatidz_profiles
    const { error: updateError } = await supabaseAdmin
      .from('asatidz_profiles')
      .update({ approved: nextStatus })
      .eq('id', userId)

    if (updateError) throw updateError

    // Catat ke Activity Log
    await supabaseAdmin.from('activity_logs').insert({
      type: 'asatidz',
      title: nextStatus ? 'Asatidz Diverifikasi' : 'Verifikasi Dicabut',
      description: `User dengan ID ${userId} diubah status verifikasinya menjadi ${nextStatus ? 'Disetujui' : 'Dibatalkan'}`,
      user_id: userId,
      related_id: userId,
      related_table: 'asatidz_profiles',
      status: nextStatus ? 'success' : 'warning'
    })

    // Kirim Notifikasi ke User Terkait
    await supabaseAdmin.from('notifications').insert({
      title: nextStatus ? 'Verifikasi Berhasil' : 'Verifikasi Dicabut',
      message: nextStatus 
        ? 'Akun Anda telah diverifikasi sebagai Asatidz.' 
        : 'Status verifikasi Asatidz Anda telah dicabut oleh admin.',
      recipient_id: userId,
      type: nextStatus ? 'success' : 'warning',
      action_url: '/dashboard/asatidz'
    })

    revalidatePath('/dashboard/admin/verifikasi')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggleVerifikasiAsatidz:', error)
    return { error: error.message || 'Gagal mengubah status verifikasi' }
  }
}

// 2. FUNGSI UPDATE DATA & ROLE USER
export async function updateUser(userId: string, nama: string, no_wa: string, role: string) {
  // LANGKAH 1: Update Auth Metadata
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

  // Catat Log Aktivitas
  await supabaseAdmin.from('activity_logs').insert({
    type: 'profile',
    title: 'Data User Diubah',
    description: `${nama} diperbarui`,
    user_id: userId,
    related_id: userId,
    related_table: 'profiles',
    status: 'info'
  })

  revalidatePath('/dashboard/admin/verifikasi')
  return { success: true }
}

// 3. FUNGSI HAPUS USER (Dibuat Aman & Berurutan)
export async function hapusUser(userId: string) {
  try {
    // Ambil nama user terlebih dahulu sebelum dihapus untuk kebutuhan log
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('nama')
      .eq('id', userId)
      .single()

    const namaUser = profile?.nama ?? 'User Tidak Diketahui'

    // Catat log terlebih dahulu sebelum relasi data dihapus
    await supabaseAdmin.from('activity_logs').insert({
      type: 'user',
      title: 'User Dihapus',
      description: `Pendaftaran Asatidz atas nama ${namaUser} ditolak & dihapus`,
      related_id: userId,
      related_table: 'profiles',
      status: 'danger'
    })

    // Hapus user dari Auth (Akan memicu CASCADE delete ke public.profiles jika FK dikonfigurasi demikian)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    revalidatePath('/dashboard/admin/verifikasi')
    return { success: true }
  } catch (error: any) {
    console.error('Error hapusUser:', error)
    return { error: `Gagal menghapus: ${error.message}` }
  }
}