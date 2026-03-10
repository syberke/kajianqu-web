import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import DonasiClient from './DonasiClient'

export default async function DonasiPage() {
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ambil data donasi
  const { data: donations, error } = await supabaseAdmin
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return <div className="p-8">Error: {error.message}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Donasi</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau arus kas masuk dan verifikasi sumbangan donatur.</p>
      </div>

      <DonasiClient initialDonasi={donations || []} />
    </div>
  )
}