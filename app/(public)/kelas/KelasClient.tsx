'use client'


import { useState } from 'react'
import Link from 'next/link'

const imgKelas      = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"
const imgPrivate    = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"
const imgGooglePlay = "https://www.figma.com/api/mcp/asset/f43088f3-2402-424b-8ba7-a28d985f7c15"
const imgAppStore   = "https://www.figma.com/api/mcp/asset/c3279e4f-e37a-410b-b3b8-a0916b096877"
const imgIconMateri = "https://www.figma.com/api/mcp/asset/801ca7ec-92f4-4ca9-b481-e9bdea576ef5"
const imgIconAI     = "https://www.figma.com/api/mcp/asset/806cc7b4-2c24-49c2-9cf1-afb66a1fee9f"
const imgIconUstadz = "https://www.figma.com/api/mcp/asset/d4a097fa-e78c-4cc3-8960-4d431b7db44e"
const imgIconGratis = "https://www.figma.com/api/mcp/asset/84ca5d09-a253-45b6-aa9a-e885cb262696"

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

function getYouTubeThumb(url: string): string {
  if (!url) return imgKelas
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  return imgKelas
}

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
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{item.description || 'Membahas Seputar Tahlilan, dan pertan...'}</p>
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
    { id: 'live'    as Tab, label: 'Live Stream'    },
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
    // pt-[72px] karena navbar fixed height 72px
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

        {/* Live Stream */}
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

        {/* Kajian Tematik */}
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

        {/* Kelas Private */}
        {activeTab === 'private' && (
          <div className="space-y-16">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="rounded-2xl overflow-hidden h-[250px] shadow-lg">
                <img src={imgPrivate} alt="Kelas Private" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-[#1a7a53]">Kelas Private</h2>
                <p className="text-gray-600 leading-relaxed">{privateData.description}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Mentoring Ustadz</h2>
                <p className="text-gray-500">Ustadz-ustadz ini yang akan mengisi materi untuk di kelas private</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {privateData.mentors.map((mentor, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden h-[220px] group cursor-pointer shadow-md">
                    <img src={imgKelas} alt={mentor.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-semibold text-sm">{mentor.nama}</p>
                      <p className="text-white/70 text-xs">{mentor.bidang}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2">
                {[0,1,2].map((i) => (
                  <button key={i} onClick={() => setMentorPage(i)}
                    className={`h-2.5 rounded-full transition-all ${mentorPage === i ? 'bg-[#1a7a53] w-6' : 'bg-gray-300 w-2.5'}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-gray-900">
                Apa saja keunggulan <span className="text-[#1a7a53]">kelas Private?</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {privateData.keunggulan.map((k, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-5 text-center space-y-3 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto text-2xl">{k.icon}</div>
                    <p className="font-bold text-gray-800">{k.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{k.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-gradient-to-b from-[#1a7a53] to-[#0d5c3a] rounded-3xl py-16 px-8 text-center overflow-hidden">
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white">Lanjutkan Di Aplikasi</h2>
                <p className="text-white/70 leading-relaxed">
                  Belajar lebih fokus dan personal melalui Kelas Privat kami. Dapatkan bimbingan langsung dari pengajar berpengalaman, materi terarah sesuai kebutuhan, serta jadwal yang fleksibel.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <img src={imgGooglePlay} alt="Google Play" className="h-14 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
                  <img src={imgAppStore}   alt="App Store"   className="h-14 object-contain cursor-pointer hover:opacity-80 transition-opacity rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}