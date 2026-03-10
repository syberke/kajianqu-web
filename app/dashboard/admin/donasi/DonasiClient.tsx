'use client'

import { useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownRight, Search, Filter, MoreHorizontal, Eye } from 'lucide-react'
import Link from 'next/link'

export default function DonasiClient({ initialDonasi }: { initialDonasi: any[] }) {
  // Hitung statistik sederhana
  const totalDonasi = initialDonasi.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const pendingCount = initialDonasi.filter(d => d.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a4d2e] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <p className="text-xs opacity-70 mb-1 font-medium">Total Donasi Terkumpul</p>
          <h3 className="text-2xl font-bold">Rp {totalDonasi.toLocaleString('id-ID')}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px]">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">Target: 100jt</span>
            <span className="opacity-70">48.2% tercapai</span>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 opacity-10" size={100} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><ArrowUpRight size={20} /></div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{pendingCount} Menunggu</span>
          </div>
          <p className="text-xs text-gray-500 font-medium mb-1">Perlu Verifikasi</p>
          <p className="text-xl font-bold text-gray-800">{pendingCount} Transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><ArrowDownRight size={20} /></div>
          </div>
          <p className="text-xs text-gray-500 font-medium mb-1">Saldo Terakhir</p>
          <p className="text-xl font-bold text-gray-800">Rp {(totalDonasi * 0.8).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Transaksi Terbaru</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari donatur..." className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1a4d2e]" />
            </div>
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50"><Filter size={14} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Donatur</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialDonasi.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{item.nama_donatur || 'Hamba Allah'}</p>
                    <p className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{item.kategori}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1a4d2e]">
                    Rp {item.amount?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      item.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {item.status === 'success' ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/admin/donasi/${item.id}`} className="p-1.5 text-gray-400 hover:text-[#1a4d2e] hover:bg-green-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </Link>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {initialDonasi.length === 0 && <p className="p-10 text-center text-gray-400 italic">Belum ada transaksi.</p>}
        </div>
      </div>
    </div>
  )
}