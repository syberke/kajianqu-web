'use client';

import { useState } from 'react';
import { Video, Youtube, Clock, CheckCircle, ExternalLink, Plus } from 'lucide-react';

export default function LiveStreamingPage() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner */}
      <div className="bg-[#064E3B] rounded-[40px] p-10 text-white flex justify-between items-center shadow-xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Live Streaming</h2>
          <p className="text-emerald-100/60 font-medium">Hubungkan Youtube Live Anda untuk menjangkau lebih banyak santri.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-lg"
        >
          <Plus size={20} /> Jadwalkan Live
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Riwayat Live */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
          <h4 className="font-black text-emerald-950 text-xl">Daftar Live Stream</h4>
          
          <div className="space-y-4">
            <LiveCard status="live" title="Tafsir Jalalain - Pertemuan 12" date="Sedang Berlangsung" />
            <LiveCard status="upcoming" title="Kajian Rutin Malam Jumat" date="Besok, 20:00 WIB" />
            <LiveCard status="ended" title="Fiqih Wanita: Bab Thaharah" date="10 Maret 2025" />
          </div>
        </div>

        {/* Stats / Info */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
          <div className="space-y-4">
            <h4 className="font-black text-emerald-950 text-lg">Tips YouTube Live</h4>
            <div className="p-5 bg-blue-50 rounded-3xl space-y-2 border border-blue-100">
              <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Penting</p>
              <p className="text-xs text-blue-600 font-medium leading-relaxed">
                Gunakan link "Embed" atau link "Watch" publik agar santri bisa menonton langsung di Dashboard Siswa.
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Youtube size={32} />
            </div>
            <p className="font-black text-emerald-950 text-sm">Integrasi YouTube</p>
            <p className="text-xs text-gray-400 font-medium px-4">Video akan otomatis masuk ke arsip materi setelah live berakhir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveCard({ status, title, date }: any) {
  return (
    <div className="flex items-center justify-between p-5 border border-gray-50 rounded-[32px] hover:bg-gray-50 transition-all group">
      <div className="flex items-center gap-5">
        <div className={`w-16 h-12 rounded-2xl flex items-center justify-center ${
          status === 'live' ? 'bg-red-500 text-white animate-pulse' : 
          status === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          <Video size={24} />
        </div>
        <div>
          <h5 className="font-black text-emerald-950 text-sm group-hover:text-emerald-600 transition-colors">{title}</h5>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
          status === 'live' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {status}
        </span>
        <ExternalLink size={16} className="text-gray-300 group-hover:text-emerald-600" />
      </div>
    </div>
  );
}