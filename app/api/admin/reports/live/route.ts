import { createExcel } from '@/lib/excel/exportExcel'
import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const sessions = await db.liveSession.findMany({
    select: { title: true, scheduledAt: true },
    orderBy: { scheduledAt: 'desc' },
  })
  const rows = sessions.map((item) => ({
    title: item.title,
    scheduled_at: item.scheduledAt?.toISOString() ?? '',
  }))

  const buffer = await createExcel(
    'Live Session',
    [
      { header: 'Judul', key: 'title', width: 40 },
      { header: 'Tanggal', key: 'scheduled_at', width: 25 },
    ],
    rows,
  )

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=live-session.xlsx',
    },
  })
}
