import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DetailDonasiClient from './DetailDonasiClient'

export default async function DetailDonasiPage({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: donasi, error } = await supabaseAdmin
    .from('donations')
    .select(`
      *,
      donation_methods (
        bank_name,
        account_name
      )
    `)
    .eq('id', id)
    .single()

  console.log('ID:', id)
  console.log('ERROR:', error)
  console.log('DONASI:', donasi)

  if (error || !donasi) {
    return notFound()
  }

  return <DetailDonasiClient donasi={donasi} />
}