'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function toggleVerifikasiAsatidz(userId: string, currentStatus: boolean) {
  try {
    const { user: admin } = await requireRole('admin')
    const nextStatus = !currentStatus

    await db.$transaction([
      db.asatidzProfile.upsert({
        where: { id: userId },
        create: { id: userId, approved: nextStatus },
        update: { approved: nextStatus },
      }),
      db.activityLog.create({
        data: {
          type: 'asatidz',
          title: nextStatus ? 'Asatidz Diverifikasi' : 'Verifikasi Dicabut',
          description: `Status verifikasi user ${userId} menjadi ${nextStatus ? 'Disetujui' : 'Dibatalkan'}`,
          userId: admin.id,
          relatedId: userId,
          relatedTable: 'asatidz_profiles',
          status: nextStatus ? 'success' : 'warning',
        },
      }),
      db.notification.create({
        data: {
          title: nextStatus ? 'Verifikasi Berhasil' : 'Verifikasi Dicabut',
          message: nextStatus
            ? 'Akun Anda telah diverifikasi sebagai Asatidz.'
            : 'Status verifikasi Asatidz Anda telah dicabut oleh admin.',
          recipientId: userId,
          type: nextStatus ? 'success' : 'warning',
          actionUrl: '/dashboard/asatidz',
        },
      }),
    ])

    revalidatePath('/dashboard/admin/verifikasi')
    revalidatePath(`/dashboard/admin/verifikasi/${userId}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal mengubah status verifikasi' }
  }
}

export async function updateUser(userId: string, nama: string, no_wa: string, role: string) {
  try {
    const { user: admin } = await requireRole('admin')
    const supabaseAdmin = getSupabaseAdmin()
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    })
    if (authError) return { error: 'Gagal mengupdate hak akses sistem' }

    await db.$transaction([
      db.profile.update({
        where: { id: userId },
        data: { nama: nama.trim(), noWa: no_wa.trim() || null, role },
      }),
      db.activityLog.create({
        data: {
          type: 'profile',
          title: 'Data User Diubah',
          description: `${nama.trim()} diperbarui`,
          userId: admin.id,
          relatedId: userId,
          relatedTable: 'profiles',
          status: 'info',
        },
      }),
    ])

    revalidatePath('/dashboard/admin/verifikasi')
    revalidatePath(`/dashboard/admin/verifikasi/${userId}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal update data profil' }
  }
}

export async function hapusUser(userId: string) {
  try {
    const { user: admin } = await requireRole('admin')
    const profile = await db.profile.findUnique({ where: { id: userId }, select: { nama: true } })
    const namaUser = profile?.nama ?? 'User Tidak Diketahui'

    await db.activityLog.create({
      data: {
        type: 'user',
        title: 'User Dihapus',
        description: `Pendaftaran Asatidz atas nama ${namaUser} ditolak dan dihapus`,
        userId: admin.id,
        relatedId: userId,
        relatedTable: 'profiles',
        status: 'danger',
      },
    })

    const supabaseAdmin = getSupabaseAdmin()
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    revalidatePath('/dashboard/admin/verifikasi')
    return { success: true }
  } catch (error) {
    return { error: `Gagal menghapus: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}
