'use client'

import { useState } from 'react'
import Link from 'next/link'
// Icon untuk bagian Keunggulan
import { Clock, BookOpen, MessageCircle, UserCheck } from 'lucide-react'

// ── Assets ──────────────────────────────────────────────────────────
const imgKelas      = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"
const imgPrivate    = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"

// UPDATE: Menggunakan path dari folder public
const imgOrnamen    = "/ornamen-islamic.png" 

// Aset Badge Store yang lebih realistis/high-quality
const badgeGooglePlay = "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
const badgeAppStore   = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"

type Tab = 'live' | 'tematik' | 'private'

interface Props {
  liveData:    any[]
  tematikData: any[]
  privateData: {
    description: string
    mentors: { nama: string; bidang: string }[]
    keunggulan: { icon: string; title: string; desc: string }[]
  }
}

// Helper YouTube Thumb
function getYouTubeThumb(url: string): string {
  if (!url) return imgKelas
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  return imgKelas
}

// Sub-Komponen Card
function KelasCard({ item, type }: { item: any; type: 'live' | 'tematik' }) {
  const thumb  = getYouTubeThumb(item.youtube_url || item.stream_url || '')
  const ustadz = item.asatidz?.nama || 'Ustadz'
  const label  = type === 'live' ? 'Live Stream' : 'Podcast'
  const href   = `/kelas/${type}/${item.id}`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-[180px] overflow-hidden rounded-t-2xl">
        <img src={thumb} alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = imgKelas }}
        />
        <div className="absolute bottom-3 left-3">
          <span className="bg-[#1a7a53] text-white text-[11px] font-semibold px-3 py-1 rounded-full">{ustadz}</span>
        </div>
        {type === 'live' && item.status === 'live' && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{item.title || 'Hukumnya Tahlilan'}</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1a7a53] rounded-full" />
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{item.description || 'Membahas Seputar Tahlilan...'}</p>
        <Link href={href} className="inline-flex items-center gap-1 text-[#1a7a53] font-semibold text-sm hover:gap-2 transition-all">
          Ikuti Kelas <span className="text-base">›</span>
        </Link>
      </div>
    </div>
  )
}

export default function KelasClient({ liveData, tematikData, privateData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('live')
  const [mentorPage, setMentorPage] = useState(0)

  const tabs = [
    { id: 'live'     as Tab, label: 'Live Stream'    },
    { id: 'tematik' as Tab, label: 'Kajian Tematik' },
    { id: 'private' as Tab, label: 'Kelas Private'  },
  ]

  const dummy = Array(3).fill({
    id: 'dummy', title: 'Hukumnya Tahlilan',
    description: 'Membahas Seputar Tahlilan, dan pertan...',
    asatidz: { nama: 'Ust. Adi Hidayat' }
  })

  const displayLive    = liveData.length    > 0 ? liveData    : dummy
  const displayTematik = tematikData.length > 0 ? tematikData : dummy

  return (
    <div className="min-h-screen bg-white pt-[72px] font-['Poppins',sans]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a7a53] to-[#0d5c3a] py-20 px-6 text-center overflow-hidden">
        <div className="absolute left-8 top-8 opacity-20 text-white text-[160px] font-serif leading-none select-none">☽</div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Program Kelas</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Mari Ikuti Kelas Unggulan Kami
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Berbagai kelas mulai dari live hingga rekaman kajian dari ustad yang bisa langsung di akses secara gratis.
          </p>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-[500px] mx-auto">
          <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-[#1a7a53] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">

        {activeTab === 'live' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Live Stream</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLive.map((item: any, i: number) => (
                <KelasCard key={item.id + i} item={item} type="live" />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tematik' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Podcast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTematik.map((item: any, i: number) => (
                <KelasCard key={item.id + i} item={item} type="tematik" />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="space-y-16">
            {/* Intro Kelas Private */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="rounded-3xl overflow-hidden h-[300px] shadow-lg relative">
                <div className="absolute inset-0 bg-black/20 z-10" />
                <img src={imgPrivate} alt="Kelas Private" className="w-full h-full object-cover relative z-0" />
              </div>
              <div className="space-y-4">
                <h2 className="text-[32px] md:text-[40px] font-bold text-[#1a7a53] leading-tight">Kelas Private</h2>
                <p className="text-gray-600 leading-relaxed text-[15px] md:text-[16px]">
                  {privateData.description}
                </p>
              </div>
            </div>

            {/* Mentoring Ustadz */}
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-[28px] md:text-[36px] font-bold text-[#0c1421]">Mentoring Ustadz</h2>
                <p className="text-gray-500 text-[15px] max-w-2xl mx-auto">
                  Ustadz-ustadz ini yang akan mengisi materi untuk di kelas private
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {privateData.mentors.map((mentor, i) => (
                  <div key={i} className="relative rounded-[24px] overflow-hidden h-[260px] group cursor-pointer shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <img src={imgKelas} alt={mentor.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[10%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a2315]/90 via-[#0a2315]/30 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-white font-bold text-[16px] md:text-lg mb-1">{mentor.nama}</p>
                      <p className="text-white/80 text-[13px] md:text-sm">{mentor.bidang}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keunggulan */}
            <div className="space-y-10">
              <h2 className="text-[28px] md:text-[36px] font-bold text-center text-[#0c1421]">
                Apa saja keunggulan <span className="text-[#1a7a53]">kelas Private?</span>
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Waktu Fleksibel", desc: "Tentukan sendiri jadwal belajarmu sesuai dengan kesibukan.", icon: <Clock size={28} strokeWidth={2.5} /> },
                  { title: "Materi Terarah", desc: "Kurikulum disesuaikan dengan kebutuhan dan kemampuan.", icon: <BookOpen size={28} strokeWidth={2.5} /> },
                  { title: "Tanya Jawab Bebas", desc: "Leluasa berdiskusi dan bertanya materi yang belum dipahami.", icon: <MessageCircle size={28} strokeWidth={2.5} /> },
                  { title: "Bimbingan Personal", desc: "Fokus 1-on-1 dengan ustadz untuk hasil yang lebih maksimal.", icon: <UserCheck size={28} strokeWidth={2.5} /> }
                ].map((k, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-[24px] p-6 md:p-8 text-center space-y-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div 
                      className="w-16 h-16 md:w-[72px] md:h-[80px] bg-[#1a7a53] flex items-center justify-center mx-auto text-white group-hover:scale-110 transition-transform duration-300 shadow-md"
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      {k.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[#0c1421] text-[16px] md:text-[18px] mb-2">{k.title}</p>
                      <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed">{k.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── LANJUTKAN DI APLIKASI (VERSI TERBARU) ── */}
            <section className="relative bg-gradient-to-br from-[#1E7F5C] via-[#166348] to-[#0D4431] py-24 px-6 overflow-hidden rounded-[40px] mt-16 shadow-2xl border border-white/10">
              
              {/* ORNAMEN KIRI ATAS */}
              <div className="absolute -top-10 -left-10 w-[250px] h-[250px] opacity-30 rotate-12 pointer-events-none animate-pulse">
                <img 
                  src={imgOrnamen} 
                  alt="ornamen" 
                  className="w-full h-full object-contain brightness-125" 
                  onError={(e) => console.log("Pastikan file ada di /public/ornamen-islamic.png")}
                />
              </div>

              {/* ORNAMEN KANAN BAWAH */}
              <div className="absolute -bottom-16 -right-16 w-[300px] h-[300px] opacity-40 -rotate-12 pointer-events-none">
                <img 
                  src={imgOrnamen} 
                  alt="ornamen" 
                  className="w-full h-full object-contain scale-110 brightness-125" 
                />
              </div>

              {/* CONTENT */}
              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold tracking-[0.2em] uppercase rounded-full">
                    Eksklusif di Mobile
                  </span>
                  <h2 className="text-white text-[32px] md:text-[48px] font-extrabold leading-tight">
                    Lanjutkan Pengalaman Belajar <br className="hidden md:block" /> 
                    <span className="text-yellow-400">Di Aplikasi Kami</span>
                  </h2>
                  <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full" />
                </div>

                <p className="text-white/80 text-[15px] md:text-[18px] leading-relaxed max-w-2xl mx-auto">
                  Belajar lebih fokus dan personal melalui Kelas Privat kami. Dapatkan bimbingan langsung dari pengajar berpengalaman, materi terarah sesuai kebutuhan, serta jadwal yang fleksibel.
                </p>

                {/* STORE BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                  <a href="#" className="transform transition-all duration-300 hover:scale-105 active:scale-95">
                    <img
                      src={badgeGooglePlay}
                      alt="Google Play"
                      className="h-[55px] md:h-[65px] object-contain shadow-2xl rounded-xl"
                    />
                  </a>

                  <a href="#" className="transform transition-all duration-300 hover:scale-105 active:scale-95">
                    <img
                      src={badgeAppStore}
                      alt="App Store"
                      className="h-[55px] md:h-[65px] object-contain shadow-2xl rounded-xl"
                    />
                  </a>
                </div>
                
                <p className="text-white/40 text-[12px] font-medium italic">
                  *Tersedia untuk Android & iOS dengan update terbaru 2026
                </p>
              </div>
            </section>
            {/* ── END LANJUTKAN DI APLIKASI ── */}

          </div>
        )}
      </div>
    </div>
  )
}