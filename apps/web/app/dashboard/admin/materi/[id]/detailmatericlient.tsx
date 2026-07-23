'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStatusMateri } from '../action'
import { ArrowLeft, PlayCircle, Info, MessageSquare, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function DetailMateriClient({ materi }: { materi: any }) {
  const router = useRouter()
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  // Ekstraksi id video YouTube yang aman untuk kebutuhan Iframe Embed
  const getEmbedUrl = (url: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !catatan.trim()) {
      return alert('Mohon isi catatan / alasan penolakan jika ingin menolak materi.')
    }
    
    if (!confirm(`Apakah Anda yakin ingin memproses keputusan [${status === 'approved' ? 'Setuju' : 'Tolak'}] untuk materi ini?`)) return

    setLoading(true)
    const res = await updateStatusMateri(materi.id, status, catatan)
    setLoading(false)

    if (res?.error) {
      alert(res.error)
    } else {
      alert(`Materi sukses ${status === 'approved' ? 'disetujui & dipublikasikan' : 'ditolak untuk direvisi'}.`)
      router.push('/dashboard/admin/materi')
    }
  }

  const videoUrl = materi.youtube_url || ''
  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Kembali ke Daftar Materi
      </button>

      <h1 className="text-2xl font-bold text-gray-800">Detail Keputusan Materi</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KIRI: VIDEO PLAYER & DESKRIPSI UTAMA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Iframe Pemutar Video Riil */}
          <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-xl border-4 border-white">
            {embedUrl ? (
              <iframe 
                className="w-full h-full"
                src={embedUrl}
                title="KajianQu Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center bg-gray-900">
                <PlayCircle size={64} className="mb-4 text-red-500 opacity-40 animate-pulse" />
                <p className="font-medium text-sm">Preview video tidak tersedia.</p>
                <p className="text-xs text-gray-500 mt-1">Format alamat tautan YouTube yang dimasukkan tidak valid.</p>
                {videoUrl && (
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    Buka Link Asli <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi Konten */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{materi.judul}</h2>
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-6 border-b pb-4">
              <span className="flex items-center gap-1 font-bold text-gray-700">
                👤 Ust. {materi.profiles?.nama || 'Tanpa Nama'}
              </span>
              <span>
                📅 Dikirim: {new Date(materi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="bg-green-50 text-[#064E3B] font-bold px-2 py-0.5 rounded">
                📚 {materi.kategori_nama}
              </span>
              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded uppercase font-mono">
                🗂 {materi.type}
              </span>
            </div>
            
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Deskripsi / Sinopsis Materi</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {materi.deskripsi || "Asatidz tidak menyertakan deskripsi tulisan penunjang untuk materi ini."}
            </p>
          </div>
        </div>

        {/* KANAN: METADATA PANEL & AKSI PERSETUJUAN */}
        <div className="space-y-6">
          
          {/* Status Metadata */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
              <Info size={18} className="text-[#064E3B]" /> Sistem Informasi Materi
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status Publikasi</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  materi.is_published 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {materi.is_published ? '✓ Terbit Publik' : '⏳ Menunggu Review'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alamat Tautan Sumber</p>
                <p className="text-xs font-mono text-gray-600 truncate mt-0.5" title={videoUrl}>
                  {videoUrl || 'Tidak terdeteksi'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ID Unik Konten</p>
                <p className="text-xs font-mono text-gray-700 font-bold">{materi.id}</p>
              </div>
            </div>
          </div>

          {/* Panel Keputusan Admin */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
              <MessageSquare size={18} className="text-[#064E3B]" /> Catatan Reviewer / Koreksi
            </h3>
            <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-1 focus:ring-[#064E3B] mb-4 text-gray-700 resize-none"
              placeholder="Berikan saran perbaikan jika menolak materi atau catatan apresiasi untuk asatidz..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={loading}
            ></textarea>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleDecision('approved')}
                disabled={loading}
                className="w-full py-3 bg-[#064E3B] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1a4d2e] transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} /> {loading ? 'Memproses...' : 'Terima & Publikasi'}
              </button>
              <button 
                onClick={() => handleDecision('rejected')}
                disabled={loading}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle size={18} /> Tolak / Butuh Revisi
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center italic px-4 leading-relaxed">
            Persetujuan materi akan mengirimkan notifikasi internal secara otomatis ke akun asatidz pembuat kelas.
          </p>
        </div>
      </div>
    </div>
  )
}