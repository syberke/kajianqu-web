'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Play, Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DetailMateriPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [materi, setMateri] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchData = async () => {
   
      const mockData = {
        title: "Hukumnya Tahlilan Bersama Ust. Adi Hidayat",
        category: "Fiqih",
        description: "Tahlilan merupakan salah satu tradisi keagamaan yang sudah lama hidup dan berkembang di tengah masyarakat Muslim Indonesia. Kegiatan ini biasanya dilakukan dengan membaca kalimat tahlil (la ilaha illallah), dzikir, doa-doa, serta ayat-ayat Al-Qur'an yang sering kali dihadiahkan pahalanya untuk orang yang telah meninggal dunia. Selain itu, tahlilan juga menjadi sarana berkumpulnya keluarga, tetangga, dan masyarakat sekitar untuk saling mendoakan, mempererat silaturahmi, serta menguatkan rasa kebersamaan.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
        instructor: "Ust. Adi Hidayat"
      };
      
      setMateri(mockData);
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1D794E]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Navigation Header */}
      <div className="p-6 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-emerald-600 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Detail Materi Keilmuan</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-10">
        
        {/* Title Section */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-emerald-900 leading-tight">
            {materi.title}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {materi.description}
          </p>
        </div>

        {/* Video Player Section (Sesuai Gambar) */}
        <div className="relative group">
          <div className="aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
            <iframe 
              src={materi.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title="Materi Player"
            ></iframe>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="flex-1 py-4 bg-[#1D794E] text-white rounded-[24px] font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-[#155d3c] transition-all">
              <Play size={18} fill="currentColor" /> Tonton Sekarang
            </button>
            <button className="px-8 py-4 bg-white text-emerald-700 border-2 border-emerald-50 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all">
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        </div>

        {/* Quiz Section (Sesuai Gambar) */}
        <div className="bg-[#D9E9E2] p-8 rounded-[32px] border-2 border-emerald-100 flex items-center justify-between group cursor-pointer hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#1D794E] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Lightbulb size={28} />
            </div>
            <div>
              <h4 className="font-black text-emerald-900 text-lg">Kuis Seputar Topik</h4>
              <p className="text-xs text-emerald-700/60 font-medium">Beberapa pertanyaan mengenai materi pada video</p>
            </div>
          </div>
          <div className="text-emerald-800 opacity-30 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={32} strokeWidth={3} />
          </div>
        </div>

        {/* Additional Info / Curriculum */}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
          <h4 className="font-black text-emerald-900 text-xl tracking-tight">Point Pembahasan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Pengantar Sejarah Tahlilan', 'Dalil-dalil Naqli', 'Tradisi vs Syariat', 'Manfaat Silaturahmi'].map((point, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}