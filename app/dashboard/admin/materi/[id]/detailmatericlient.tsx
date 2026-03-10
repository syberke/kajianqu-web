'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStatusMateri } from '../action'
import { ArrowLeft, PlayCircle, Info, MessageSquare, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function DetailMateriClient({ materi }: { materi: any }) {
  const router = useRouter()
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  // Fungsi untuk convert link youtube biasa ke embed
  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
  }

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !catatan) return alert('Mohon isi catatan jika menolak materi.')
    
    setLoading(true)
    const res = await updateStatusMateri(materi.id, status, catatan)
    setLoading(false)

    if (res.error) {
      alert(res.error)
    } else {
      alert(`Materi berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`)
      router.push('/dashboard/admin/materi')
    }
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
        <ArrowLeft size={16} /> Kembali ke Daftar Materi
      </button>

      <h1 className="text-2xl font-bold text-gray-800">Detail Keputusan Materi</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KIRI: VIDEO & DESKRIPSI */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Card */}
          <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-xl border-4 border-white">
            {getEmbedUrl(materi.video_url) ? (
              <iframe 
                className="w-full h-full"
                src={getEmbedUrl(materi.video_url)!}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
                <PlayCircle size={64} className="mb-4 opacity-20" />
                <p>Preview tidak tersedia. Link YouTube tidak valid.</p>
                <a href={materi.video_url} target="_blank" className="mt-4 px-4 py-2 bg-white/10 rounded-lg flex items-center gap-2">
                  Buka di YouTube <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* Deskripsi Materi */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{materi.judul}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-6">
              <span className="flex items-center gap-1 font-bold text-gray-800">
                👤 Ust. {materi.profiles?.nama}
              </span>
              <span>📅 Dikirim: {new Date(materi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>📚 Fiqh Ibadah</span>
              <span>🟢 Mudah</span>
            </div>
            
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Deskripsi Materi</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {materi.deskripsi || "Tidak ada deskripsi."}
            </p>
          </div>
        </div>

        {/* KANAN: METADATA & KEPUTUSAN */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
              <Info size={18} className="text-green-600" /> Metadata Materi
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status Saat Ini</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  materi.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                  materi.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {materi.status === 'pending' ? 'Menunggu Review' : materi.status === 'approved' ? 'Terverifikasi' : 'Butuh Revisi'}
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Durasi Video</p>
                <p className="text-sm font-bold text-gray-800">12:45 Menit</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Kualitas Resolusi</p>
                <p className="text-sm font-bold text-gray-800">1080p (Full HD)</p>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
              <MessageSquare size={18} className="text-green-600" /> Catatan Reviewer
            </h3>
            <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-1 focus:ring-green-600 mb-4"
              placeholder="Tuliskan alasan jika menolak materi atau catatan tambahan untuk asatidz..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            ></textarea>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleDecision('approved')}
                disabled={loading}
                className="w-full py-3 bg-[#064E3B] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1a4d2e] transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} /> Terima & Publikasi
              </button>
              <button 
                onClick={() => handleDecision('rejected')}
                disabled={loading}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle size={18} /> Tolak Materi
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center italic">
            Materi ini hanya berupa link youtube dan akan langsung diarahkan ke channel pemilik materi.
          </p>
        </div>
      </div>
    </div>
  )
}