'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export async function updateStatusDonasi(
  donasiId: string,
  status: 'paid' | 'failed',
  catatan?: string,
) {
  try {
    const { user } = await requireRole('admin')
    const donation = await db.donation.findUnique({
      where: { id: donasiId },
      select: { id: true, donorName: true },
    })
    if (!donation) return { error: 'Donasi tidak ditemukan' }

    await db.$transaction([
      db.donation.update({
        where: { id: donasiId },
        data: { paymentStatus: status, note: catatan?.trim() || null },
      }),
      db.activityLog.create({
        data: {
          type: 'donation',
          title: status === 'paid' ? 'Donasi Diverifikasi' : 'Donasi Ditolak',
          description: `${donation.donorName || 'Hamba Allah'}: ${catatan?.trim() || 'tanpa catatan'}`,
          userId: user.id,
          relatedId: donation.id,
          relatedTable: 'donations',
          status: status === 'paid' ? 'success' : 'danger',
        },
      }),
    ])

    revalidatePath('/dashboard/admin/donasi')
    revalidatePath(`/dashboard/admin/donasi/${donasiId}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Gagal memperbarui status donasi' }
  }
}
