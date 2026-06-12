import { createClient } from '@supabase/supabase-js'
import { createExcel } from '@/lib/excel/exportExcel'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('donations')
    .select('*')

  const buffer = await createExcel(
    'Donasi',
    [
      { header: 'Donatur', key: 'donor_name', width: 30 },
      { header: 'Nominal', key: 'nominal', width: 20 },
      { header: 'Status', key: 'payment_status', width: 20 }
    ],
    data || []
  )

  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename=donasi.xlsx'
    }
  })
}