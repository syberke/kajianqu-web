import { createExcel } from '@/lib/excel/exportExcel'
import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const rows = await db.profile.findMany({
    where: { role: 'asatidz' },
    select: { nama: true, email: true, role: true },
    orderBy: { nama: 'asc' },
  })

  const buffer = await createExcel(
    'Asatidz',
    [
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
    ],
    rows,
  )

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asatidz.xlsx',
    },
  })
}
