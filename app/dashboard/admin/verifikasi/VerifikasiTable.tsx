'use client'

import { useState } from 'react'
import { toggleVerifikasiAsatidz, hapusUser } from './action'
import { ClipboardList, Users, Wallet, Filter, Eye, CheckCircle2, XCircle, Download, Check } from 'lucide-react'
import Link from 'next/link'
export type User = {
  id: string
  nama: string
  email: string
  role: string
  no_wa: string
  created_at: string
  asatidz_profiles?: {
    bidang: string
    approved: boolean
  } | null
}

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'terdaftar'>('pending')

  // Filter Data berdasarkan Tab
  const pendingUsers = initialUsers.filter(u => !u.asatidz_profiles?.approved)
  const registeredUsers = initialUsers.filter(u => u.asatidz_profiles?.approved)
  const displayedUsers = activeTab === 'pending' ? pendingUsers : registeredUsers

  // Format Tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // --- HANDLERS ---
  const handleApprove = async (userId: string, currentStatus: boolean) => {
    if (!confirm('Yakin ingin memverifikasi Asatidz ini?')) return
    setLoadingId(userId)
    // Ingat: kita butuh dummy email jika action meminta email, pastikan action.ts sudah disesuaikan sebelumnya
    const res = await toggleVerifikasiAsatidz(userId, currentStatus) 
    setLoadingId(null)
    if (res.error) alert(res.error)
  }

  const handleReject = async (userId: string, nama: string) => {
    if (!confirm(`Tolak dan hapus pendaftaran ${nama}?`)) return
    setLoadingId(userId)
    const res = await hapusUser(userId)
    setLoadingId(null)
    if (res.error) alert(res.error)
  }

  // Komponen Inisial Avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      
      {/* 1. KARTU STATISTIK (Dinamis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><ClipboardList size={20} /></div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md text-orange-600 bg-orange-50">+{pendingUsers.length} Baru</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Verifikasi Tertunda</p>
            <p className="text-xl font-bold text-gray-800">{pendingUsers.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20} /></div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Asatidz Terdaftar</p>
            <p className="text-xl font-bold text-gray-800">{registeredUsers.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Wallet size={20} /></div>
            <span className="text-[10px] font-medium px-2 py-1 text-gray-400">Keseluruhan</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Donasi Terkumpul</p>
            <p className="text-xl font-bold text-gray-800">Rp 100.000</p>
          </div>
        </div>
      </div>

      {/* 2. AREA TABEL & FILTER */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* TABS HEADER */}
        <div className="flex border-b border-gray-100 px-6 pt-2">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Pending Verification
          </button>
          <button 
            onClick={() => setActiveTab('terdaftar')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'terdaftar' ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Asatidz Terdaftar
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">
              {activeTab === 'pending' ? 'Menunggu Peninjauan' : 'Daftar Asatidz Aktif'}
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="pb-3 pl-2">Profil</th>
                  <th className="pb-3">Keistimewaan & Latar Belakang</th>
                  <th className="pb-3">Tanggal Kirim</th>
                  <th className="pb-3 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {getInitials(user.nama)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.nama}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-800">{user.asatidz_profiles?.bidang || '-'}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">Data background statis</p>
                    </td>
                    <td className="py-4 text-gray-500 text-xs">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex justify-end items-center gap-3">
                        {activeTab === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(user.id, false)}
                              disabled={loadingId === user.id}
                              className="px-4 py-1.5 bg-[#064E3B] text-white text-xs font-bold rounded hover:bg-[#1a4d2e] transition-colors disabled:opacity-50"
                            >
                              Memeriksa
                            </button>
                            <button 
                              onClick={() => handleReject(user.id, user.nama)}
                              disabled={loadingId === user.id}
                              className="px-4 py-1.5 text-red-500 text-xs font-bold rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Menolak
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleApprove(user.id, true)}
                            disabled={loadingId === user.id}
                            className="px-4 py-1.5 text-red-500 text-xs font-bold border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Cabut Verifikasi
                          </button>
                        )}
                       <Link href={`/dashboard/admin/verifikasi/${user.id}`} className="p-1.5 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors block">
  <Eye size={18} />
</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {displayedUsers.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Tidak ada data di kategori ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. WIDGET BAWAH (Recent & Pedoman) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verifikasi Terbaru */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Verifikasi Terbaru</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-green-100 text-green-600 rounded-full p-1"><CheckCircle2 size={16} /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">Ust. Hasan Alfatih approved</p>
                <p className="text-xs text-gray-500">Diverifikasi oleh Admin • 2 jam yang lalu</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-red-100 text-red-500 rounded-full p-1"><XCircle size={16} /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">Application Rejected</p>
                <p className="text-xs text-gray-500">Dokumen identitas tidak valid • 5 jam yang lalu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pedoman Verifikasi */}
        <div className="bg-[#E8F5E9] p-6 rounded-xl border border-green-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#064E3B] mb-2">Pedoman Verifikasi</h3>
            <p className="text-xs text-[#064E3B]/80 mb-4 leading-relaxed">
              Pastikan semua pelamar memenuhi standar kualitas dan integritas kami yang ketat sebelum menyetujui akses.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-[#064E3B]"><Check size={16} /> Kredensial Pendidikan yang Valid</li>
              <li className="flex items-center gap-2 text-sm text-[#064E3B]"><Check size={16} /> Rekam Jejak Digital Bersih</li>
              <li className="flex items-center gap-2 text-sm text-[#064E3B]"><Check size={16} /> Pencocokan Dokumen Identitas</li>
            </ul>
          </div>
          <button className="self-start flex items-center gap-2 bg-[#064E3B] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-[#1a4d2e] transition-colors">
            <Download size={16} /> Unduh SOP
          </button>
        </div>

      </div>
    </div>
  )
}