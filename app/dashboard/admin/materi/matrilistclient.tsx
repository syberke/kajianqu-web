'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MoreVertical, ChevronRight } from 'lucide-react'

export default function MateriListClient({ initialMateri }: { initialMateri: any[] }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const filteredMateri = initialMateri.filter(m => {
    if (activeTab === 'pending') return m.status === 'pending'
    if (activeTab === 'approved') return m.status === 'approved'
    return m.status === 'rejected'
  })

  return (
    <div className="space-y-6">
      {/* TABS HEADER */}
      <div className="flex border-b border-gray-100 gap-8">
        <TabButton label="Menunggu Review" count={initialMateri.filter(m => m.status === 'pending').length} active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
        <TabButton label="Disetujui" active={activeTab === 'approved'} onClick={() => setActiveTab('approved')} />
        <TabButton label="Perlu Revisi" active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">
            {activeTab === 'pending' ? 'Menunggu Peninjauan' : activeTab === 'approved' ? 'Telah Disetujui' : 'Perlu Perbaikan'}
          </h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Telusuri Materi..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-64 outline-none focus:ring-1 focus:ring-[#064E3B]" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredMateri.map((item) => (
            <Link 
              key={item.id} 
              href={`/dashboard/admin/materi/${item.id}`}
              className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                  {item.profiles?.nama?.[0] || 'M'}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.judul}</p>
                  <p className="text-xs text-gray-500">Ust. {item.profiles?.nama} • {item.deskripsi.substring(0, 50)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  item.status === 'pending' ? 'bg-orange-50 text-orange-500' : 
                  item.status === 'approved' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                }`}>
                  {item.status === 'pending' ? 'Tertunda' : item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </span>
                <span className="text-xs text-gray-400 italic">2 menit yang lalu</span>
                <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-600" />
              </div>
            </Link>
          ))}
          {filteredMateri.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm italic">Tidak ada materi di kategori ini.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, count, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${active ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
    >
      {label} {count !== undefined && <span className="bg-green-100 text-[#064E3B] text-[10px] px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  )
}