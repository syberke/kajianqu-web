import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import UserTable, { User } from './VerifikasiTable'

export default async function ManageVerifikasiPage() {
  await requireRole('admin')

  // Gunakan Client murni (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ambil data KHUSUS Asatidz, urutkan dari yang terbaru
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      nama,
      email,
      role,
      no_wa,
      created_at,
      asatidz_profiles (
        bidang,
        approved
      )
    `)
    .eq('role', 'asatidz')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error mengambil data: {error.message}</div>
  }

  // Format data agar sesuai tipe
  const formattedUsers: User[] = (users || []).map((user: any) => {
    const asatidzData = Array.isArray(user.asatidz_profiles) 
      ? user.asatidz_profiles[0] 
      : user.asatidz_profiles

    return {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      no_wa: user.no_wa,
      created_at: user.created_at,
      asatidz_profiles: asatidzData ? {
        bidang: asatidzData.bidang,
        approved: asatidzData.approved
      } : null
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Asatidz</h1>
          <p className="text-sm text-gray-500 mt-1">Verifikasi aplikasi baru dan kelola pendaftaran Asatidz yang sudah ada.</p>
        </div>
      </div>
      
      {/* Panggil komponen Client yang baru */}
      <UserTable initialUsers={formattedUsers} />
    </div>
  )
}