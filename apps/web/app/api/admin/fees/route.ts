import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const materials = await db.material.findMany({
    where: { workflowStatus: 'PUBLISHED', asatidzId: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: {
      asatidz: { select: { nama: true } },
      fees: { take: 1 },
    },
  })

  return NextResponse.json({
    materials: materials.map((material) => {
      const fee = material.fees[0]
      return {
        id: material.id,
        title: material.title,
        asatidzId: material.asatidzId,
        asatidzName: material.asatidz?.nama ?? 'Asatidz KajianQu',
        publishedAt: material.publishedAt?.toISOString() ?? null,
        fee: fee
          ? {
              id: fee.id,
              amount: Number(fee.amount),
              asatidzId: fee.asatidzId,
              status: fee.status,
              note: fee.note,
              createdAt: fee.createdAt.toISOString(),
            }
          : null,
      }
    }),
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = z.object({
    materialId: z.uuid(),
    amount: z.coerce.number().min(0).max(1_000_000_000),
    note: z.string().trim().max(500).optional(),
  }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data fee tidak valid.' }, { status: 400 })

  const material = await db.material.findFirst({
    where: {
      id: parsed.data.materialId,
      workflowStatus: 'PUBLISHED',
      asatidzId: { not: null },
    },
    select: { id: true, title: true, asatidzId: true },
  })
  if (!material?.asatidzId) return NextResponse.json({ error: 'Materi belum dipublikasikan atau tidak memiliki Asatidz.' }, { status: 404 })

  const fee = await db.fee.upsert({
    where: { materialId: material.id },
    create: {
      materialId: material.id,
      asatidzId: material.asatidzId,
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || null,
      status: 'payable',
      decidedBy: admin.id,
    },
    update: {
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || null,
      status: 'payable',
      decidedBy: admin.id,
    },
  })

  await db.notification.create({
    data: {
      title: 'Fee Materi Ditetapkan',
      message: `Fee untuk materi "${material.title}" sebesar Rp${parsed.data.amount.toLocaleString('id-ID')} telah dicatat.`,
      recipientId: material.asatidzId,
      type: 'success',
      actionUrl: '/dashboard/asatidz/earnings',
    },
  })

  return NextResponse.json({ fee: { id: fee.id, amount: Number(fee.amount), status: fee.status } })
}
