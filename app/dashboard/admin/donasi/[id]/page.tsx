import { notFound } from 'next/navigation'

import DetailDonasiClient from './DetailDonasiClient'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function DetailDonasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole('admin')

  const donation = await db.donation.findUnique({
    where: { id },
    include: { method: { select: { bankName: true, accountName: true } } },
  })

  if (!donation) notFound()

  return (
    <DetailDonasiClient
      donasi={{
        id: donation.id,
        donor_name: donation.donorName,
        category: donation.category,
        nominal: donation.nominal.toNumber(),
        note: donation.note,
        payment_status: donation.paymentStatus,
        payment_proof_url: donation.paymentProofUrl,
        created_at: donation.createdAt.toISOString(),
        updated_at: donation.updatedAt.toISOString(),
        donation_methods: donation.method
          ? { bank_name: donation.method.bankName, account_name: donation.method.accountName }
          : null,
      }}
    />
  )
}
