import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DetailMateriClient from './detailmatericlient'

export default async function DetailMateriPage({ params }: { params: { id: string } }) {
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: materials, error } = await supabaseAdmin
    .from('materials')
    .select(`
      *,
      profiles:asatidz_id ( nama, email )
    `)
    .eq('id', params.id)
    .single()

  if (error || !materials) return notFound()

  return <DetailMateriClient materi={materials} />
}