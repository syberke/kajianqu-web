import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const tagSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tags = await db.expertiseTag.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { asatidz: true } } },
  })
  return NextResponse.json({
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      sortOrder: tag.sortOrder,
      isActive: tag.isActive,
      asatidzCount: tag._count.asatidz,
    })),
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = tagSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data tag tidak valid.' }, { status: 400 })

  const baseSlug = slugify(parsed.data.name)
  if (!baseSlug) return NextResponse.json({ error: 'Nama tag tidak valid.' }, { status: 400 })

  try {
    const tag = await db.expertiseTag.create({
      data: {
        name: parsed.data.name,
        slug: baseSlug,
        description: parsed.data.description?.trim() || null,
        sortOrder: parsed.data.sortOrder,
        createdBy: admin.id,
      },
    })
    return NextResponse.json({ tag }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Nama tag sudah digunakan.' }, { status: 409 })
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = z.object({ id: z.uuid(), isActive: z.boolean() }).safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data perubahan tidak valid.' }, { status: 400 })

  const tag = await db.expertiseTag.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  })
  return NextResponse.json({ tag })
}
