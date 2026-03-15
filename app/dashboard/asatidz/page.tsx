'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Video, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function AsatidzDashboard() {
  const [stats, setStats] = useState({ materialCount: 0, liveCount: 0, studentCount: 0 });
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex">
      {/* Sidebar - Sama dengan desain siswa tapi menu berbeda */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-3 px-2">
          <img src="https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png" alt="Logo" className="h-30" />
        </div>
        
        <nav className="flex flex-col gap-2">
          <SidebarItem icon={<TrendingUp size={20} />} label="Dashboard" active />
          <SidebarItem icon={<BookOpen size={20} />} label="Materi Saya" />
          <SidebarItem icon={<Video size={20} />} label="Jadwal Live" />
          <SidebarItem icon={<MessageSquare size={20} />} label="Chat Santri" badge="12" />
          <SidebarItem icon={<Users size={20} />} label="Data Siswa" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Banner - Mirip desain Jadwal Sholat */}
        <div className="bg-[#064E3B] rounded-[40px] p-8 text-white relative overflow-hidden mb-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-black">Ahlan wa Sahlan, Ust. Adi Hidayat</h2>
              <p className="text-emerald-100/60 font-medium">Siap membagikan ilmu dan keberkahan hari ini?</p>
            </div>
            <button className="bg-white text-[#064E3B] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-50 transition-all">
              <Plus size={20} strokeWidth={3} /> Buat Kajian Baru
            </button>
          </div>
          {/* Glow Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <StatCard label="Total Siswa" value="1,284" icon={<Users className="text-blue-600" />} color="bg-blue-50" />
              <StatCard label="Materi Aktif" value="42" icon={<BookOpen className="text-emerald-600" />} color="bg-emerald-50" />
              <StatCard label="Live Session" value="12" icon={<Video className="text-orange-600" />} color="bg-orange-50" />
            </div>

            {/* Jadwal Live Mendatang - List style seperti Jadwal Live di Gambar 3 */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-emerald-950 text-xl tracking-tighter">Jadwal Live Mendatang</h4>
                <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Lihat Semua</button>
              </div>
              <div className="space-y-4">
                <LiveItem title="Hukum Tahlilan Bagian 2" date="Minggu, 16 Maret 2025" time="20:00 WIB" />
                <LiveItem title="Tanya Jawab Fiqih Ibadah" date="Selasa, 18 Maret 2025" time="19:30 WIB" />
              </div>
            </div>
          </div>

          {/* Right Column: Chat/Pesan Terbaru - Mirip Gambar 3 */}
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-black text-emerald-950 text-xl tracking-tighter">Pesan Santri</h4>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">12 BARU</span>
            </div>
            
            <div className="space-y-6 overflow-y-auto">
              <ChatItem name="Ahmad Fulan" msg="Ustadz, izin bertanya mengenai..." time="12m" />
              <ChatItem name="Siti Aminah" msg="Jazakallah khair ustadz atas..." time="45m" />
              <ChatItem name="Budi Santoso" msg="Apakah besok ada kajian?" time="1h" />
              <ChatItem name="Ahmad Fulan" msg="Ustadz, izin bertanya mengenai..." time="12m" />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
               <input 
                type="text" 
                placeholder="Cari santri..." 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all"
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function SidebarItem({ icon, label, active = false, badge = "" }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-emerald-50 text-emerald-700 font-black' : 'text-gray-400 hover:bg-gray-50 font-bold'}`}>
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-3">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-emerald-950">{value}</p>
      </div>
    </div>
  );
}

function LiveItem({ title, date, time }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">
          <Video size={20} />
        </div>
        <div>
          <h5 className="font-black text-emerald-950 text-sm leading-none mb-1">{title}</h5>
          <p className="text-[10px] font-bold text-gray-400 uppercase">{date} • {time}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  );
}

function ChatItem({ name, msg, time }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-12 h-12 bg-[#064E3B] rounded-2xl flex items-center justify-center text-white font-black text-sm">
        {name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h5 className="font-black text-emerald-950 text-sm">{name}</h5>
          <span className="text-[10px] font-bold text-gray-300 uppercase">{time}</span>
        </div>
        <p className="text-xs text-gray-400 font-medium truncate">{msg}</p>
      </div>
    </div>
  );
}