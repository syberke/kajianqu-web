import { createClient } from '@supabase/supabase-js'
import { createExcel } from '@/lib/excel/exportExcel'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('materials')
    .select('*')

  const buffer = await createExcel(
    'Materi',
    [
      { header: 'Judul', key: 'title', width: 40 },
      { header: 'Slug', key: 'slug', width: 30 }
    ],
    data || []
  )

  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename=materi.xlsx'
    }
  })
}