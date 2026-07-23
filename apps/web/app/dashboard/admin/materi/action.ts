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
      select: { id: true, title: true, asatidzId: true, workflowStatus: true },
    })
    if (!material) return { error: 'Materi tidak ditemukan' }
    if (!['SUBMITTED', 'IN_REVIEW'].includes(material.workflowStatus)) {
      return { error: 'Materi ini tidak berada di antrean review. Muat ulang halaman untuk melihat status terbaru.' }
    }

    const isApproved = status === 'approved'
    const note = catatan.trim() || null

    await db.$transaction([
      db.material.update({
        where: { id: materiId },
        data: {
          isPublished: isApproved,
          reviewStatus: status,
          reviewNote: note,
          workflowStatus: isApproved ? 'PUBLISHED' : status === 'rejected' ? 'REVISION_REQUIRED' : 'IN_REVIEW',
          publishedAt: isApproved ? new Date() : null,
          publishedBy: isApproved ? admin.id : null,
        },
      }),
      db.materialReview.create({
        data: {
          materialId: materiId,
          reviewerId: admin.id,
          decision: isApproved ? 'approved' : status === 'rejected' ? 'revision_required' : 'comment',
          note: note || (isApproved ? 'Materi disetujui dan dipublikasikan.' : 'Materi dikembalikan ke antrean review.'),
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
    revalidatePath('/dashboard/admin/fees')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal memperbarui status materi' }
  }
}
