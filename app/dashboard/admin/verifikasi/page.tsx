import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import UserTable, { User } from './VerifikasiTable'

export default async function ManageVerifikasiPage() {
  await requireRole('admin')

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Ambil data Khusus Asatidz
  const { data: users, error: userError } = await supabaseAdmin
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
        latar_belakang,
        approved
      )
    `)
    .eq('role', 'asatidz')
    .order('created_at', { ascending: false })

  // 2. AMBIL DATA NYATA: Total Donasi Terkumpul (Hanya yang berstatus 'paid')
  const { data: donations } = await supabaseAdmin
    .from('donations')
    .select('nominal')
    .eq('payment_status', 'paid')

  const totalDonasi = donations?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0

  // 3. AMBIL DATA NYATA: Log Aktivitas Terbaru untuk Widget Bawah
  const { data: logs } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .eq('type', 'asatidz')
    .order('created_at', { ascending: false })
    .limit(3)

  if (userError) {
    return <div className="p-8 text-red-500">Error mengambil data: {userError.message}</div>
  }

  // Format data agar sesuai tipe interface frontend
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
        bidang: asatidzData.bidang || '-',
        latar_belakang: asatidzData.latar_belakang || '-',
        approved: asatidzData.approved || false
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
      
      {/* Oper data riil donasi dan riil logs ke komponen Client */}
      <UserTable 
        initialUsers={formattedUsers} 
        totalDonations={totalDonasi} 
        recentLogs={logs || []}
      />
    </div>
  )
}