import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import MateriListClient from './MateriListClient'

export default async function MateriPage() {
  // Proteksi hak akses agar hanya Admin yang bisa masuk halaman ini
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ambil data materi keilmuan riil dari database Supabase
  const { data: materials, error } = await supabaseAdmin
    .from('materials')
    .select(`
      id,
      type,
      keilmuan_id,
      title,
      slug,
      description,
      summary,
      youtube_url,
      thumbnail_url,
      asatidz_id,
      is_published,
      created_at,
      updated_at,
      profiles!materials_asatidz_id_fkey (
        nama
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl">
        <p className="font-bold">Gagal memuat data materi:</p>
        <p className="text-sm font-mono mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Materi Keilmuan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan review konten edukasi islami yang masuk ke platform.</p>
      </div>

      {/* Kirim data murni hasil kueri fungsional ke Client Component */}
      <MateriListClient initialMateri={materials || []} />
    </div>
  )
}