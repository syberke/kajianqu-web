import DonasiClient from './DonasiClient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function DonasiPage() {
  await requireRole('admin')

  const [donations, targetSetting] = await Promise.all([
    db.donation.findMany({ orderBy: { createdAt: 'desc' } }),
    db.setting.findUnique({ where: { key: 'donation_target' }, select: { value: true } }),
  ])

  const target = Number(targetSetting?.value || 100_000_000)
  const initialDonasi = donations.map((item) => ({
    id: item.id,
    user_id: item.userId,
    category: item.category,
    nominal: item.nominal.toNumber(),
    method_id: item.methodId,
    donor_name: item.donorName,
    note: item.note,
    payment_status: item.paymentStatus,
    payment_proof_url: item.paymentProofUrl,
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Donasi</h1>
        <p className="mt-1 text-sm text-gray-500">Pantau arus kas masuk dan verifikasi sumbangan donatur.</p>
      </div>
      <DonasiClient initialDonasi={initialDonasi} donationTarget={target} />
    </div>
  )
}
