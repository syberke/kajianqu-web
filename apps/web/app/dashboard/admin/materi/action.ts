'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export async function updateStatusMateri(
  materiId: string,
  status: 'approved' | 'rejected' | 'pending',
  catatan: string,
) {
  try {
    const { user: admin } = await requireRole('admin')
    const material = await db.material.findUnique({
      where: { id: materiId },
      select: { id: true, title: true, asatidzId: true },
    })
    if (!material) return { error: 'Materi tidak ditemukan' }

    const isApproved = status === 'approved'
    const note = catatan.trim() || null

    await db.$transaction([
      db.material.update({
        where: { id: materiId },
        data: {
          isPublished: isApproved,
          reviewStatus: status,
          reviewNote: note,
        },
      }),
      db.activityLog.create({
        data: {
          type: 'material',
          title: isApproved ? 'Materi Disetujui' : status === 'rejected' ? 'Materi Membutuhkan Revisi' : 'Materi Dikembalikan ke Review',
          description: `Materi "${material.title}" diubah menjadi ${status}. Catatan: ${note || '-'}`,
          userId: admin.id,
          relatedId: materiId,
          relatedTable: 'materials',
          status: isApproved ? 'success' : status === 'rejected' ? 'danger' : 'warning',
        },
      }),
      ...(material.asatidzId
        ? [
            db.notification.create({
              data: {
                title: isApproved ? 'Materi Disetujui' : status === 'rejected' ? 'Materi Perlu Revisi' : 'Status Materi Diperbarui',
                message: isApproved
                  ? `Barakallah, materi Anda "${material.title}" telah diterbitkan.`
                  : status === 'rejected'
                    ? `Materi "${material.title}" memerlukan perbaikan: ${note || 'Silakan tinjau kembali materi Anda.'}`
                    : `Materi "${material.title}" dikembalikan ke status review.`,
                recipientId: material.asatidzId,
                type: isApproved ? 'success' : 'warning',
                actionUrl: `/dashboard/asatidz/keilmuan/${material.id}`,
              },
            }),
          ]
        : []),
    ])

    revalidatePath('/dashboard/admin/materi')
    revalidatePath(`/dashboard/admin/materi/${materiId}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal memperbarui status materi' }
  }
}
