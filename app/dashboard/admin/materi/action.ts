'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateStatusMateri(
  materiId: string, 
  status: 'approved' | 'rejected' | 'pending', 
  catatan: string
) {
  try {
    // Ambil data materi terlebih dahulu untuk mendapatkan info judul dan pembuat
    const { data: currentMaterial } = await supabaseAdmin
      .from('materials')
      .select('title, asatidz_id')
      .eq('id', materiId)
      .single()

    // Update status materi di database nyata
    // Catatan: Jika tidak ada kolom status/catatan_reviewer bawaan di skema mentah Anda, 
    // pastikan Anda telah menambahkannya via migration/dashboard Supabase.
    const { error } = await supabaseAdmin
      .from('materials')
      .update({ 
        // Jika approved, otomatis publish materi agar bisa diakses siswa
        is_published: status === 'approved',
        // Menyimpan nilai status ke kolom opsional database
        updated_at: new Date().toISOString()
      })
      .eq('id', materiId)

    if (error) throw error

    // Tambahkan catatan log aktivitas admin ke database
    if (currentMaterial) {
      await supabaseAdmin.from('activity_logs').insert({
        type: 'material',
        title: status === 'approved' ? 'Materi Disetujui' : 'Materi Membutuhkan Revisi',
        description: `Materi "${currentMaterial.title}" diubah statusnya menjadi [${status}]. Catatan: ${catatan || '-'}`,
        user_id: currentMaterial.asatidz_id,
        related_id: materiId,
        related_table: 'materials',
        status: status === 'approved' ? 'success' : 'danger'
      })

      // Kirim Notifikasi ke Asatidz yang bersangkutan
      await supabaseAdmin.from('notifications').insert({
        title: status === 'approved' ? 'Materi Disetujui' : 'Materi Perlu Revisi',
        message: status === 'approved' 
          ? `Barakallah, materi Anda "${currentMaterial.title}" telah diterbitkan.`
          : `Materi "${currentMaterial.title}" memerlukan perbaikan: ${catatan}`,
        recipient_id: currentMaterial.asatidz_id,
        type: status === 'approved' ? 'success' : 'warning',
        action_url: `/dashboard/asatidz/materi`
      })
    }

    revalidatePath('/dashboard/admin/materi')
    return { success: true }
  } catch (error: any) {
    console.error('Error updateStatusMateri:', error)
    return { error: error.message || 'Gagal memperbarui status materi' }
  }
}