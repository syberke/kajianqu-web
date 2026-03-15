'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MateriService } from '@/service/materi'

export default function DetailMateriPage({ params }: { params: { id: string } }) {

  const router = useRouter()
  const materialId = params.id

  const [materi, setMateri] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchData(){

      if(!materialId) return

      try{

        const data = await MateriService.getMaterialById(materialId)

        setMateri(data)

      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }

    }

    fetchData()

  },[materialId])

  // Helper YouTube Embed
  const getYoutubeEmbed = (url: string) => {
    if (!url) return "";
    let id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
    return `https://www.youtube.com/embed/${id}`;
  };

  // State Loading saat ID belum siap
  if (loading && (!materi)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Menyiapkan Materi...</p>
      </div>
    );
  }

  // State Jika Data Tetap Tidak Ada
  if (!materi) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={60} className="text-red-500 mb-4" />
        <h2 className="text-xl font-black text-emerald-950">Materi Tidak Ditemukan</h2>
        <button onClick={() => router.back()} className="mt-6 text-emerald-600 font-bold underline">Kembali</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-[#F8FAF9]/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <ChevronLeft size={24} />
        </button>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Detail Materi</p>
          <p className="text-xs font-black text-emerald-700 uppercase mt-1 tracking-tight">{materi.keilmuan?.nama}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-10 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg font-black italic">
                {materi.asatidz?.nama?.[0] || 'U'}
             </div>
             <p className="text-sm font-black text-emerald-950">Ust. {materi.asatidz?.nama || 'Pembimbing'}</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-emerald-950 leading-tight tracking-tighter">
            {materi.title}
          </h1>
        </div>

        {/* Player */}
        <div className="aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl border-4 md:border-8 border-white bg-black">
          <iframe 
            src={getYoutubeEmbed(materi.youtube_url)}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {/* Deskripsi */}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
          <h4 className="font-black text-emerald-600 text-[10px] tracking-[0.2em] uppercase mb-4">Deskripsi Materi</h4>
          <p className="text-sm text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">{materi.description}</p>
        </div>
      </div>
    </div>
  );
}