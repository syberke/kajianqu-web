import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import MateriListClient from './matrilistclient'

export default async function MateriPage() {
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ambil data materi beserta info Asatidz-nya
  const { data: materials, error } = await supabaseAdmin
    .from('materials')
    .select(`
      *,
      profiles:asatidz_id ( nama )
    `)
    .order('created_at', { ascending: false })

  if (error) return <div className="p-8">Error: {error.message}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Materi Keilmuan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan review konten edukasi islami yang masuk ke platform.</p>
      </div>

      <MateriListClient initialMateri={materials || []} />
    </div>
  )
}