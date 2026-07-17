import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      notifications: notifications.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        is_read: item.isRead,
        created_at: item.createdAt.toISOString(),
      })),
      unreadCount: notifications.filter((item) => !item.isRead).length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil notifikasi'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
