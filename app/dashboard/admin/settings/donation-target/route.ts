import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const rawValue = String(formData.get('value') ?? '').trim()
  const numericValue = Number(rawValue)
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return NextResponse.json({ error: 'Target donasi tidak valid' }, { status: 400 })
  }

  await db.setting.upsert({
    where: { key: 'donation_target' },
    create: { key: 'donation_target', value: String(Math.trunc(numericValue)) },
    update: { value: String(Math.trunc(numericValue)) },
  })

  return NextResponse.redirect(new URL('/dashboard/admin/settings', request.url))
}
