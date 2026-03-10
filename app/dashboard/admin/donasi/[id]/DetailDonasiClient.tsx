'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStatusDonasi } from '../action'
import { ArrowLeft, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function DetailDonasiClient({ donasi }: { donasi: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Menyesuaikan status sukses/gagal dengan kolom payment_status
  const handleAction = async (newStatus: 'success' | 'failed') => {
    const confirmMsg = newStatus === 'success' 
      ? "Verifikasi donasi ini? Pastikan dana sudah masuk ke rekening." 
      : "Tolak donasi ini?"
    
    if (!confirm(confirmMsg)) return

    setLoading(true)
    const res = await updateStatusDonasi(donasi.id, newStatus)
    setLoading(false)

    if (res.error) {
      alert("Gagal: " + res.error)
    } else {
      alert(`Donasi berhasil ${newStatus === 'success' ? 'diverifikasi' : 'ditolak'}`)
      router.push('/dashboard/admin/donasi')
    }
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
        <ArrowLeft size={16} /> Kembali ke Daftar Donasi
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* KIRI: BUKTI TRANSFER - Menggunakan kolom payment_proof_url */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-bold text-gray-800 text-sm">Bukti Transfer</h3>
            <a 
              href={donasi.payment_proof_url} 
              target="_blank" 
              className="text-[#1a4d2e] text-xs font-bold flex items-center gap-1 hover:underline"
            >
              <Download size={14} /> Lihat Ukuran Penuh
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 aspect-3/4 flex items-center justify-center">
            {donasi.payment_proof_url ? (
              <img src={donasi.payment_proof_url} alt="Bukti" className="w-full h-full object-contain" />
            ) : (
              <p className="text-gray-400 text-xs italic">Bukti tidak ditemukan</p>
            )}
          </div>
        </div>

        {/* KANAN: INFO & KEPUTUSAN */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Detail Informasi</h3>
            <div className="space-y-4">
               <InfoRow label="ID Transaksi" value={`#${donasi.id.substring(0,8).toUpperCase()}`} />
               <InfoRow label="Nama Donatur" value={donasi.donor_name || 'Hamba Allah'} />
               <InfoRow label="Kategori" value={donasi.category} />
               {/* Mengambil nama bank dari hasil join payment_methods jika ada */}
               <InfoRow label="Metode" value={donasi.payment_methods?.bank_name || 'Transfer Bank'} />
               <InfoRow label="Tanggal" value={new Date(donasi.created_at).toLocaleString('id-ID')} />
               
               <hr className="border-gray-50 my-4" />
               
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm font-medium">Nominal Donasi</span>
                 <span className="text-2xl font-bold text-[#1a4d2e]">
                   {/* Menggunakan kolom nominal */}
                   Rp {donasi.nominal?.toLocaleString('id-ID')}
                 </span>
               </div>
            </div>
            
            {/* Tombol Aksi - Menggunakan kolom payment_status */}
            {donasi.payment_status === 'pending' ? (
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => handleAction('success')}
                   disabled={loading}
                   className="py-3 bg-[#1a4d2e] text-white rounded-xl font-bold text-sm hover:bg-[#064E3B] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                 >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} 
                    Verifikasi
                 </button>
                 <button 
                   onClick={() => handleAction('failed')}
                   disabled={loading}
                   className="py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                 >
                    <XCircle size={18} /> Tolak
                 </button>
              </div>
            ) : (
              <div className={`mt-8 p-4 rounded-xl text-center font-bold text-sm ${
                donasi.payment_status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                STATUS: {donasi.payment_status === 'success' ? 'SUDAH DIVERIFIKASI' : 'TRANSAKSI DITOLAK'}
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
            <div className="text-blue-500 mt-1"><CheckCircle size={16} /></div>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              Pastikan Anda telah memeriksa mutasi rekening secara manual sebelum menekan tombol verifikasi. Transaksi yang sudah diverifikasi akan menambah saldo publik di dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-800 font-bold">{value}</span>
    </div>
  )
}