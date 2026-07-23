import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as { id?: string } | null
  if (!payload?.id) {
    return NextResponse.json({ success: false, error: 'ID notifikasi wajib diisi' }, { status: 400 })
  }

  try {
    await db.notification.update({
      where: { id: payload.id },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui notifikasi'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
