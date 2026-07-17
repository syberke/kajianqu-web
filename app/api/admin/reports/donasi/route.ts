import { createExcel } from '@/lib/excel/exportExcel'
import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const donations = await db.donation.findMany({
    select: { donorName: true, nominal: true, paymentStatus: true },
  })
  const rows = donations.map((item) => ({
    donor_name: item.donorName,
    nominal: item.nominal.toNumber(),
    payment_status: item.paymentStatus,
  }))

  const buffer = await createExcel(
    'Donasi',
    [
      { header: 'Donatur', key: 'donor_name', width: 30 },
      { header: 'Nominal', key: 'nominal', width: 20 },
      { header: 'Status', key: 'payment_status', width: 20 },
    ],
    rows,
  )

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=donasi.xlsx',
    },
  })
}
