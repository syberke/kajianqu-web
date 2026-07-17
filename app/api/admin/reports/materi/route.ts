import { createExcel } from '@/lib/excel/exportExcel'
import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const rows = await db.material.findMany({
    select: { title: true, slug: true },
    orderBy: { title: 'asc' },
  })

  const buffer = await createExcel(
    'Materi',
    [
      { header: 'Judul', key: 'title', width: 40 },
      { header: 'Slug', key: 'slug', width: 30 },
    ],
    rows,
  )

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=materi.xlsx',
    },
  })
}
