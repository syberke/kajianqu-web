import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DetailDonasiClient from './DetailDonasiClient'

export default async function DetailDonasiPage({ params }: { params: { id: string } }) {
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: donasi, error } = await supabaseAdmin
    .from('donations')
    .select(`
      *,
      payment_methods ( bank_name, account_name )
    `)
    .eq('id', params.id)
    .single()

  if (error || !donasi) return notFound()

  return <DetailDonasiClient donasi={donasi} />
}