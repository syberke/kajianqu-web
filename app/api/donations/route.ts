import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

interface DonationPayload {
  category?: string
  nominal?: number
  methodId?: string
  donorName?: string
  note?: string
  paymentProofUrl?: string
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as DonationPayload | null
  const nominal = Number(payload?.nominal)
  const methodId = payload?.methodId?.trim()
  if (!Number.isFinite(nominal) || nominal <= 0 || !methodId) {
    return NextResponse.json({ error: 'Nominal dan metode pembayaran wajib valid' }, { status: 400 })
  }

  const method = await db.donationMethod.findFirst({ where: { id: methodId, isActive: true }, select: { id: true } })
  if (!method) return NextResponse.json({ error: 'Metode pembayaran tidak tersedia' }, { status: 400 })

  const donation = await db.donation.create({
    data: {
      userId: user.id,
      category: payload?.category?.trim() || null,
      nominal,
      methodId,
      donorName: payload?.donorName?.trim() || user.user_metadata?.nama || user.email || 'Hamba Allah',
      note: payload?.note?.trim() || null,
      paymentStatus: 'pending',
      paymentProofUrl: payload?.paymentProofUrl?.trim() || null,
    },
  })

  return NextResponse.json({ id: donation.id, status: donation.paymentStatus }, { status: 201 })
}

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const donations = await db.donation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { method: true },
    take: 100,
  })

  return NextResponse.json({
    donations: donations.map((item) => ({
      id: item.id,
      category: item.category,
      nominal: item.nominal.toNumber(),
      donor_name: item.donorName,
      note: item.note,
      payment_status: item.paymentStatus,
      payment_proof_url: item.paymentProofUrl,
      created_at: item.createdAt.toISOString(),
      donation_methods: item.method ? { bank_name: item.method.bankName, account_name: item.method.accountName } : null,
    })),
  })
}
