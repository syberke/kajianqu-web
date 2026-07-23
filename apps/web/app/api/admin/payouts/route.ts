import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const payoutSchema = z.object({
  feeId: z.uuid(),
  storagePath: z.string().trim().min(12).max(500),
  fileHash: z.string().regex(/^[a-f0-9]{64}$/),
})

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = payoutSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Bukti transfer tidak valid.' }, { status: 400 })

  const fee = await db.fee.findUnique({
    where: { id: parsed.data.feeId },
    include: { material: { select: { title: true } } },
  })
  if (!fee || fee.status !== 'payable') {
    return NextResponse.json({ error: 'Fee tidak ditemukan atau sudah dibayarkan.' }, { status: 409 })
  }

  const expectedPrefix = `payouts/${fee.asatidzId}/`
  if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: 'Lokasi bukti transfer tidak valid.' }, { status: 400 })
  }

  const payout = await db.$transaction(async (tx) => {
    const item = await tx.payout.create({
      data: {
        asatidzId: fee.asatidzId,
        totalAmount: fee.amount,
        status: 'PAID',
        createdBy: admin.id,
        paidAt: new Date(),
        items: {
          create: { feeId: fee.id, amount: fee.amount },
        },
        proofs: {
          create: {
            storagePath: parsed.data.storagePath,
            fileHash: parsed.data.fileHash,
            uploadedBy: admin.id,
          },
        },
      },
    })
    await tx.fee.update({ where: { id: fee.id }, data: { status: 'paid' } })
    await tx.notification.create({
      data: {
        title: 'Fee Telah Ditransfer',
        message: `Fee materi "${fee.material.title}" sebesar Rp${Number(fee.amount).toLocaleString('id-ID')} telah ditransfer. Bukti transfer tersedia di halaman pendapatan.`,
        recipientId: fee.asatidzId,
        type: 'success',
        actionUrl: '/dashboard/asatidz/earnings',
      },
    })
    return item
  })

  return NextResponse.json({ payout: { id: payout.id, status: payout.status } }, { status: 201 })
}
