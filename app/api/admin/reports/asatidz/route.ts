import { createClient } from '@supabase/supabase-js'
import { createExcel } from '@/lib/excel/exportExcel'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'asatidz')

  const buffer = await createExcel(
    'Asatidz',
    [
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 }
    ],
    data || []
  )

  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename=asatidz.xlsx'
    }
  })
}