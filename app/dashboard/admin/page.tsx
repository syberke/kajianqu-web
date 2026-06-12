import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { Users, ClipboardList, Wallet, ArrowRightLeft, Download, LifeBuoy } from 'lucide-react'
import Link from 'next/link'
import ActivityMenu from '@/components/ActivityMenu'

export default async function AdminDashboard() {
  
  // 1. Proteksi Hak Akses Admin
  const { profile } = await requireRole('admin')

  // 2. Inisialisasi Supabase Admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Tarik Data Statistik Utama
  const { count: totalAsatidz } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'asatidz')

  const { count: pendingAsatidz } = await supabaseAdmin
    .from('asatidz_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('approved', false)

  const { data: donations } = await supabaseAdmin
    .from('donations')
    .select('nominal')
    .eq('payment_status', 'paid')

  const totalDonasi = donations?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0

  const { count: totalLive } = await supabaseAdmin
    .from('live_sessions')
    .select('*', { count: 'exact', head: true })

  // 4. Ambil 5 Donasi Terakhir Riil
  const { data: latestDonations } = await supabaseAdmin
    .from('donations')
    .select('*')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5)

  // 5. Kalkulasi Nominal Donasi berkala (Hari ini & Minggu Ini)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const { data: todayDonations } = await supabaseAdmin
    .from('donations')
    .select('nominal')
    .eq('payment_status', 'paid')
    .gte('created_at', startOfToday.toISOString())

  const todayTotal = todayDonations?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0

  const { data: weekDonations } = await supabaseAdmin
    .from('donations')
    .select('nominal')
    .eq('payment_status', 'paid')
    .gte('created_at', startOfWeek.toISOString())

  const weekTotal = weekDonations?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0

  // 6. Ambil 10 Log Aktivitas Terkini
  const { data: activities } = await supabaseAdmin
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // 7. Pengaturan Target & Status Sistem
  const { data: targetSetting } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'donation_target')
    .single()

  const donationTarget = Number(targetSetting?.value || 100000000)
  const progress = Math.min((totalDonasi / donationTarget) * 100, 100)

  const { data: settings } = await supabaseAdmin.from('settings').select('*')
  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || ''

  const supportWhatsapp = getSetting('support_whatsapp')
  const donationEnabled = getSetting('donation_enabled') === 'true'
  const registrationEnabled = getSetting('asatidz_registration') === 'true'
  const maintenanceMode = getSetting('maintenance_mode') === 'true' 

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="bg-[#1a4d2e] rounded-2xl p-8 text-white flex justify-between items-center relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Selamat Datang, {profile.nama.split(' ')[0]}</h2>
          <p className="text-green-100 text-sm mb-6 leading-relaxed">
            Saat ini terdapat {totalAsatidz || 0} asatidz, {pendingAsatidz || 0} menunggu verifikasi, dan total donasi mencapai Rp {totalDonasi.toLocaleString('id-ID')}.
          </p>
          <Link
            href="/dashboard/admin/verifikasi"
            className="inline-flex items-center bg-white text-[#1a4d2e] px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors"
          >
            + Tambah Asatidz Baru
          </Link>
        </div>
        <div className="absolute -right-6 -bottom-10 opacity-10 text-[200px] pointer-events-none">📖</div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} title="Total Asatidz" value={totalAsatidz || 0} badge="Live" badgeColor="text-blue-600 bg-blue-100" />
        <StatCard icon={<ClipboardList className="text-orange-500" />} title="Menunggu Verifikasi" value={pendingAsatidz || 0} badge={`${pendingAsatidz || 0} Baru`} badgeColor="text-orange-600 bg-orange-100" />
        <StatCard icon={<Wallet className="text-green-500" />} title="Jumlah Donasi" value={`Rp ${totalDonasi.toLocaleString('id-ID')}`} badge="Live" badgeColor="text-green-600 bg-green-100" />
        <StatCard icon={<ArrowRightLeft className="text-red-500" />} title="Live Session" value={totalLive || 0} badge="Aktif" badgeColor="text-red-600 bg-red-100" />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AKTIVITAS TERKINI */}
        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#064E3B]">🕒</span> Aktivitas Terkini
            </h3>
            <Link href="/dashboard/admin/reports" className="text-xs text-gray-400 hover:text-[#064E3B] font-medium">Lihat Semua</Link>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {/* Render Log Donasi Baru */}
            {latestDonations?.map((donation) => (
              <ActivityItem
                key={donation.id}
                itemId={donation.id}
                itemType="donation"
                avatar="💰"
                color="bg-green-100 text-green-600"
                name={donation.donor_name || 'Hamba Allah'}
                desc={`Donasi Rp ${Number(donation.nominal).toLocaleString('id-ID')}`}
                status="SELESAI"
                statusColor="text-green-500"
                time={new Date(donation.created_at).toLocaleDateString('id-ID')}
              />
            ))}
            
            {/* Render Sistem Activity Log */}
            {activities?.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                itemId={activity.related_id || activity.id}
                itemType={activity.type}
                avatar={activity.type === 'donation' ? '💰' : activity.type === 'asatidz' ? '👨‍🏫' : '📖'}
                color="bg-green-100 text-green-600"
                name={activity.title}
                desc={activity.description}
                status={activity.status?.toUpperCase() || 'INFO'}
                statusColor={activity.status === 'danger' ? 'text-red-500' : activity.status === 'warning' ? 'text-amber-500' : 'text-green-500'}
                time={new Date(activity.created_at).toLocaleDateString('id-ID')}
                border={index !== activities.length - 1}
              />
            ))}
          </div>
        </div>

        {/* WIDGET DONASI & PINTASAN SYSTEM */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Wallet size={18} className="text-[#064E3B]" /> DONASI
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-gray-500 font-medium">Sasaran Bulanan</span>
              <span className="font-bold text-gray-800">Rp {donationTarget.toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div className="bg-[#10B981] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">
              {progress.toFixed(1)}% tercapai dari target Rp {donationTarget.toLocaleString('id-ID')}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1">Minggu ini</p>
                <p className="font-bold text-green-500 text-sm">Rp {weekTotal.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Hari ini</p>
                <p className="font-bold text-gray-800 text-sm">Rp {todayTotal.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-800">Status Sistem</h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">Modul Fitur Donasi</span>
                <span className={donationEnabled ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded'}>
                  {donationEnabled ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pendaftaran Asatidz</span>
                <span className={registrationEnabled ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded'}>
                  {registrationEnabled ? 'DIBUKA' : 'DITUTUP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode Pemeliharaan (Maintenance)</span>
                <span className={maintenanceMode ? 'text-orange-600 bg-orange-50 px-2 py-0.5 rounded' : 'text-green-600 bg-green-50 px-2 py-0.5 rounded'}>
                  {maintenanceMode ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Pintasan Cepat</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/admin/reports" className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                <Download size={20} className="text-gray-400 group-hover:text-[#064E3B] mb-2" />
                <span className="text-xs font-semibold text-gray-600">Report</span>
              </Link>
              <a href={`https://wa.me/${supportWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                <LifeBuoy size={20} className="text-gray-400 group-hover:text-[#064E3B] mb-2" />
                <span className="text-xs font-semibold text-gray-600">Support</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- SUB-KOMPONEN STATISTIK ---
function StatCard({ icon, title, value, badge, badgeColor }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${badgeColor}`}>{badge}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

// --- SUB-KOMPONEN BARIS AKTIVITAS ---
function ActivityItem({ itemId, itemType, avatar, color, name, desc, status, statusColor, time, border = true }: any) {
  return (
    <div className={`flex items-center justify-between p-4 ${border ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
          {avatar}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">{name}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-[10px] font-bold ${statusColor} hidden sm:block`}>{status}</span>
        <span className="text-xs text-gray-400 w-20 text-right font-mono">{time}</span>
        
        {/* Kunci Perubahan: Melemparkan Id riil dan tipe log ke Client Dropdown */}
        <ActivityMenu id={itemId} type={itemType} />
      </div>
    </div>
  )
}