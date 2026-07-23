import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'
import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'

const donationSchema = z.object({
  category: z.string().trim().max(80).optional(),
  nominal: z.coerce.number().positive().max(1_000_000_000),
  methodId: z.uuid(),
  donorName: z.string().trim().max(120).optional(),
  note: z.string().trim().max(1_000).optional(),
  paymentProofUrl: z.string().trim().min(8).max(500),
  idempotencyKey: z.string().trim().min(16).max(128),
})

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rate = checkRateLimit(`donation:${requestIdentity(request, user.id)}`, 10, 60_000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan tunggu sebentar.' }, {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const parsed = donationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data donasi tidak valid' }, { status: 400 })
  const payload = parsed.data
  const { nominal, methodId } = payload

  const method = await db.donationMethod.findFirst({ where: { id: methodId, isActive: true }, select: { id: true } })
  if (!method) return NextResponse.json({ error: 'Metode pembayaran tidak tersedia' }, { status: 400 })

  const proofPath = payload.paymentProofUrl
  if (!proofPath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Lokasi bukti pembayaran tidak valid' }, { status: 400 })
  }

  const existing = await db.donation.findUnique({ where: { idempotencyKey: payload.idempotencyKey } })
  const donation = existing ?? await db.donation.create({
      data: {
        userId: user.id,
        category: payload.category || null,
        nominal,
        methodId,
        donorName: payload.donorName || user.user_metadata?.nama || user.email || 'Hamba Allah',
        note: payload.note || null,
        paymentStatus: 'pending',
        paymentProofUrl: proofPath,
        idempotencyKey: payload.idempotencyKey,
      },
    })
  if (donation.userId !== user.id) return NextResponse.json({ error: 'Permintaan duplikat tidak valid.' }, { status: 409 })

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
