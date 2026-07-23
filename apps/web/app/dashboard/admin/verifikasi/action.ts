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

export async function reviewAsatidzApplication(
  userId: string,
  decision: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED',
  note: string,
) {
  try {
    const { user: admin } = await requireRole('admin')
    const reviewNote = note.trim()
    if (decision !== 'APPROVED' && reviewNote.length < 5) {
      return { error: 'Catatan admin wajib diisi minimal 5 karakter.' }
    }

    const applicant = await db.profile.findUnique({
      where: { id: userId },
      include: {
        asatidzProfile: {
          include: {
            documents: { select: { documentType: true } },
            expertise: { select: { tagId: true } },
          },
        },
      },
    })
    if (!applicant || applicant.role !== 'asatidz' || !applicant.asatidzProfile) {
      return { error: 'Pendaftaran Asatidz tidak ditemukan.' }
    }

    if (decision === 'APPROVED') {
      const detail = applicant.asatidzProfile
      const complete = Boolean(
        applicant.nama.trim()
          && applicant.email.trim()
          && applicant.noWa?.trim()
          && detail.formalEducation?.trim()
          && detail.pengalamanMengajar?.trim()
          && detail.bank?.trim()
          && detail.noRekening?.trim()
          && detail.bankAccountName?.trim()
          && detail.memorizationJuz !== null
          && detail.expertise.length
          && detail.documents.some((document) => document.documentType === 'cv'),
      )
      if (!complete) return { error: 'Pendaftaran belum lengkap dan tidak dapat disetujui.' }
      if (detail.status !== 'PENDING_REVIEW') {
        return { error: 'Pendaftaran harus dikirim oleh Asatidz sebelum dapat disetujui.' }
      }
    }

    const approved = decision === 'APPROVED'
    const notificationMessage = approved
      ? 'Alhamdulillah, akun Asatidz Anda telah disetujui. Fitur mengajar kini aktif.'
      : decision === 'REVISION_REQUIRED'
        ? `Pendaftaran memerlukan perbaikan: ${reviewNote}`
        : `Pendaftaran belum dapat diterima: ${reviewNote}`

    await db.$transaction([
      db.asatidzProfile.update({
        where: { id: userId },
        data: {
          approved,
          status: decision,
          reviewNote: reviewNote || null,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      }),
      db.activityLog.create({
        data: {
          type: 'asatidz',
          title: approved ? 'Asatidz Disetujui' : decision === 'REVISION_REQUIRED' ? 'Revisi Asatidz Diminta' : 'Pendaftaran Asatidz Ditolak',
          description: `${applicant.nama}: ${reviewNote || 'Disetujui tanpa catatan tambahan'}`,
          userId: admin.id,
          relatedId: userId,
          relatedTable: 'asatidz_profiles',
          status: approved ? 'success' : decision === 'REVISION_REQUIRED' ? 'warning' : 'danger',
        },
      }),
      db.notification.create({
        data: {
          title: approved ? 'Akun Asatidz Disetujui' : decision === 'REVISION_REQUIRED' ? 'Perbaiki Pendaftaran Asatidz' : 'Status Pendaftaran Asatidz',
          message: notificationMessage,
          recipientId: userId,
          type: approved ? 'success' : 'warning',
          actionUrl: approved ? '/dashboard/asatidz' : '/dashboard/asatidz/profile',
        },
      }),
    ])

    revalidatePath('/dashboard/admin/verifikasi')
    revalidatePath(`/dashboard/admin/verifikasi/${userId}`)
    revalidatePath('/dashboard/asatidz')
    revalidatePath('/dashboard/asatidz/profile')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal memproses pendaftaran Asatidz.' }
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
