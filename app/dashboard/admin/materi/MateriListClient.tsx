'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MoreVertical } from 'lucide-react'

export default function MateriListClient({ initialMateri }: { initialMateri: any[] }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  // Mapping status berdasarkan flag is_published dari database jika kolom status eksplisit belum ada
  const getMappedStatus = (item: any) => {
    if (item.is_published) return 'approved'
    // Anda bisa menyesuaikan kondisi ini jika menambahkan kolom 'status' kustom di database
    if (item.status) return item.status 
    return 'pending'
  }

  // Filter Berdasarkan Tab Aktif dan Input Pencarian
  const filteredMateri = initialMateri.filter(m => {
    const currentStatus = getMappedStatus(m)
    const matchesTab = currentStatus === activeTab
    
    const matchesSearch = 
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.profiles?.nama?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Format Tanggal / Waktu Pembuatan Konten
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* TABS HEADER */}
      <div className="flex border-b border-gray-100 gap-8">
        <TabButton 
          label="Menunggu Review" 
          count={initialMateri.filter(m => getMappedStatus(m) === 'pending').length} 
          active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')} 
        />
        <TabButton 
          label="Disetujui / Publik" 
          count={initialMateri.filter(m => getMappedStatus(m) === 'approved').length}
          active={activeTab === 'approved'} 
          onClick={() => setActiveTab('approved')} 
        />
        <TabButton 
          label="Perlu Revisi" 
          count={initialMateri.filter(m => getMappedStatus(m) === 'rejected').length}
          active={activeTab === 'rejected'} 
          onClick={() => setActiveTab('rejected')} 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-bold text-gray-800">
            {activeTab === 'pending' ? 'Menunggu Peninjauan' : activeTab === 'approved' ? 'Telah Disetujui & Terbit' : 'Perlu Perbaikan'}
          </h3>
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul materi atau asatidz..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-full sm:w-64 outline-none focus:ring-1 focus:ring-[#064E3B]" 
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredMateri.map((item) => {
            const currentStatus = getMappedStatus(item)
            return (
              <Link 
                key={item.id} 
                href={`/dashboard/admin/materi/${item.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/80 transition-all group gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {item.profiles?.nama?.[0] || 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm group-hover:text-[#064E3B] transition-colors">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ust. {item.profiles?.nama || 'Anonim'} • {item.description ? `${item.description.substring(0, 70)}...` : 'Tidak ada deskripsi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-3 sm:pt-0">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    currentStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 
                    currentStatus === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {currentStatus === 'pending' ? 'Tertunda' : currentStatus === 'approved' ? 'Terbit' : 'Ditolak'}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{formatTimeAgo(item.created_at)}</span>
                  <MoreVertical size={16} className="text-gray-300 group-hover:text-gray-600 hidden sm:block" />
                </div>
              </Link>
            )
          })}
          
          {filteredMateri.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-sm italic bg-gray-50/50 rounded-2xl border border-dashed">
              Tidak ada materi di kategori ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
        active ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {label} 
      {count !== undefined && count > 0 && (
        <span className="bg-[#E8F5E9] text-[#064E3B] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}