

import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { Users, ClipboardList, Wallet, ArrowRightLeft, Download, LifeBuoy } from 'lucide-react'

export default async function AdminDashboard() {
  // 1. Pastikan hanya Admin yang bisa akses
  const { profile } = await requireRole('admin')

  // 2. Gunakan Supabase Admin Client untuk mengambil data (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. AMBIL DATA DINAMIS DARI DATABASE
  // Menghitung total user yang role-nya 'asatidz'
  const { count: totalAsatidz } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'asatidz')

  // Menghitung asatidz yang belum di-approve
  const { count: pendingAsatidz } = await supabaseAdmin
    .from('asatidz_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('approved', false)


  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER */}
      <div className="bg-[#1a4d2e] rounded-2xl p-8 text-white flex justify-between items-center relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-bold mb-2">Selamat Datang, {profile.nama.split(' ')[0]}</h2>
          <p className="text-green-100 text-sm mb-6 leading-relaxed">
            Kelola program Anda, verifikasi guru, dan lacak aliran donasi dalam satu platform terpadu. Semuanya tampak luar biasa hari ini.
          </p>
          <button className="bg-white text-[#1a4d2e] px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
            + Tambah Asatidz Baru
          </button>
        </div>
        {/* Dekorasi Logo / Ikon di Kanan */}
        <div className="absolute -right-6 -bottom-10 opacity-10 text-[200px] pointer-events-none">
          📖
        </div>
      </div>

      {/* 2. STATS CARDS (Data Dinamis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          title="Total Asatidz" 
          value={totalAsatidz || 0} 
          badge="Live" 
          badgeColor="text-blue-600 bg-blue-100" 
        />
        <StatCard 
          icon={<ClipboardList className="text-orange-500" />} 
          title="Menunggu Verifikasi" 
          value={pendingAsatidz || 0} 
          badge={`${pendingAsatidz || 0} Baru`} 
          badgeColor="text-orange-600 bg-orange-100" 
        />
        <StatCard 
          icon={<Wallet className="text-green-500" />} 
          title="Jumlah Donasi" 
          value="Rp 100.000" 
          badge="+Rp 20.000" 
          badgeColor="text-green-600 bg-green-100" 
        />
        <StatCard 
          icon={<ArrowRightLeft className="text-purple-500" />} 
          title="Jumlah Transfer" 
          value="Rp 100.000" 
          badge="Keseluruhan" 
          badgeColor="text-gray-500 bg-gray-100" 
        />
      </div>

      {/* 3. BOTTOM SECTION (Aktivitas & Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kiri: Aktivitas Terkini (Makan 2 Kolom) */}
        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-[#064E3B]">🕒</span> Aktivitas Terkini
            </h3>
            <button className="text-xs text-gray-400 hover:text-[#064E3B] font-medium">Lihat Semua</button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <ActivityItem 
              avatar="AF" color="bg-gray-800" name="Ust. Ahmad Fauzi" desc="Pendaftaran guru baru telah dikirimkan." 
              status="TERTUNDA" statusColor="text-orange-500" time="2 menit yang lalu" 
            />
            <ActivityItem 
              avatar="💰" color="bg-green-100 text-green-600" name="Pencairan Zakat Maal" desc="Didistribusikan kepada 15 penerima di Bandung" 
              status="SELESAI" statusColor="text-green-500" time="1 jam yang lalu" 
            />
            <ActivityItem 
              avatar="YM" color="bg-blue-800" name="Ust. Yusuf Mansur" desc="Ustadz telah di verifikasi oleh admin" 
              status="TERVERIFIKASI" statusColor="text-green-500" time="3 jam yang lalu" 
            />
            <ActivityItem 
              avatar="⚠️" color="bg-red-50 text-red-500" name="Pemeliharaan Sistem" desc="Pengoptimalan data dasar selesai" 
              status="SISTEM" statusColor="text-gray-400" time="Kemarin" border={false}
            />
          </div>
        </div>

        {/* Kanan: Widget Donasi & Pintasan (Makan 1 Kolom) */}
        <div className="space-y-6">
          {/* Card Donasi */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Wallet size={18} className="text-[#064E3B]" /> DONASI
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-gray-500 font-medium">Sasaran Bulanan</span>
              <span className="font-bold text-gray-800">Rp 100.000</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div className="bg-[#10B981] h-2 rounded-full" style={{ width: '48.2%' }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mb-4">48.2% tercapai dari target 100 juta</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-1">Minggu ini</p>
                <p className="font-bold text-green-500 text-sm">+Rp 8.4M</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Hari ini</p>
                <p className="font-bold text-gray-800 text-sm">Rp 1.2M</p>
              </div>
            </div>
          </div>

          {/* Card Pintasan */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Pintasan Cepat</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                <Download size={20} className="text-gray-400 group-hover:text-[#064E3B] mb-2" />
                <span className="text-xs font-semibold text-gray-600">Report</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                <LifeBuoy size={20} className="text-gray-400 group-hover:text-[#064E3B] mb-2" />
                <span className="text-xs font-semibold text-gray-600">Support</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- KOMPONEN BANTUAN ---

function StatCard({ icon, title, value, badge, badgeColor = "text-green-600 bg-green-100" }: any) {
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

function ActivityItem({ avatar, color, name, desc, status, statusColor, time, border = true }: any) {
  return (
    <div className={`flex items-center justify-between p-4 ${border ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${color}`}>
          {avatar}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">{name}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-[10px] font-bold ${statusColor}`}>{status}</span>
        <span className="text-xs text-gray-400 w-24 text-right">{time}</span>
        <button className="text-gray-400 hover:text-gray-800">⋮</button>
      </div>
    </div>
  )
}