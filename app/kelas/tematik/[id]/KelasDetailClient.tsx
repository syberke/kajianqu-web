'use client'

// app/kelas/[type]/[id]/KelasDetailClient.tsx
// Sesuai screenshot 4 (Live Stream detail) dan 5 (Kajian Tematik detail)
// - Breadcrumb
// - Judul besar
// - Deskripsi (untuk tematik)
// - Video player (YouTube embed atau thumbnail)
// - Tombol "Tonton Sekarang" + "Bagikan"
// - Grid 3x2 "Temukan Kajian Lainnya"

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Play } from 'lucide-react'

const imgLogo   = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgKelas  = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"
const imgWA     = "https://www.figma.com/api/mcp/asset/76804cd5-fffd-4270-98f8-a1df1731d6ec"
const imgIG     = "https://www.figma.com/api/mcp/asset/312a2fb9-7fe3-4a0f-bcf7-f58d23ebe756"

interface Props {
  item:         any
  type:         'live' | 'tematik'
  relatedItems: any[]
}

// ── Helpers ──────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumb(url: string): string {
  const id = getYouTubeId(url)
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  return imgKelas
}

// ── Related Card ────────────────────────────────────────────────────
function RelatedCard({ item, type }: { item: any; type: 'live' | 'tematik' }) {
  const thumb   = getYouTubeThumb(item.youtube_url || item.stream_url || '')
  const ustadz  = item.asatidz?.nama || 'Ustadz'
  const label   = type === 'live' ? 'Live Stream' : 'Podcast'
  const href    = `/kelas/${type}/${item.id}`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-[150px] overflow-hidden rounded-t-2xl">
        <img src={thumb} alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = imgKelas }}
        />
        <div className="absolute bottom-2 left-2">
          <span className="bg-[#1a7a53] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
            {ustadz}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.title || 'Hukumnya Tahlilan'}</h4>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#1a7a53] rounded-full" />
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2">{item.description || 'Membahas Seputar Tahlilan, dan pertan...'}</p>
        <Link href={href} className="inline-flex items-center gap-1 text-[#1a7a53] font-semibold text-xs hover:gap-2 transition-all">
          Ikuti Kelas <span>›</span>
        </Link>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
export default function KelasDetailClient({ item, type, relatedItems }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied]       = useState(false)

  const videoUrl  = item.youtube_url || item.stream_url || ''
  const youtubeId = getYouTubeId(videoUrl)
  const thumb     = getYouTubeThumb(videoUrl)
  const ustadz    = item.asatidz?.nama || 'Ust. Adi Hidayat'
  const breadcrumb = type === 'live' ? 'Live Stream' : 'Kajian Tematik'
  const breadHref  = `/kelas?tab=${type}`

  // Dummy related kalau kosong
  const displayRelated = relatedItems.length > 0
    ? relatedItems
    : Array(6).fill({ id: 'dummy', title: 'Hukumnya Tahlilan', description: 'Membahas Seputar Tahlilan, dan pertan...', asatidz: { nama: 'Ust. Adi Hidayat' } })

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: buka share dialog
      if (navigator.share) navigator.share({ title: item.title, url: window.location.href })
    }
  }

  return (
    <div className="bg-[#f5faf8] min-h-screen font-['Poppins',sans-serif]">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-[70px] flex items-center justify-between">
          <Link href="/welcome">
            <img src={imgLogo} alt="KajianQu" className="h-10 object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/welcome" className="hover:text-[#1a7a53] transition-colors">Beranda</Link>
            <Link href="/welcome" className="hover:text-[#1a7a53] transition-colors">Fitur</Link>
            <Link href="/kelas"   className="text-[#1a7a53] font-bold">Kelas</Link>
            <Link href="/welcome" className="hover:text-[#1a7a53] transition-colors">Donasi</Link>
          </div>
          <Link href="/login" className="bg-[#1a7a53] text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-[#15613f] transition-colors">
            Masuk
          </Link>
        </div>
      </nav>

      <div className="max-w-[860px] mx-auto px-6 pt-[90px] pb-20 space-y-8">

        {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={breadHref} className="hover:text-[#1a7a53] transition-colors">{breadcrumb}</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-semibold line-clamp-1">{item.title || 'Hukumnya Tahlilan'}</span>
        </div>

        {/* ── JUDUL ── */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {item.title || `Hukumnya Tahlilan Bersama ${ustadz}`}
        </h1>

        {/* ── DESKRIPSI (hanya untuk tematik, sesuai screenshot 5) ── */}
        {type === 'tematik' && item.description && (
          <p className="text-gray-600 leading-relaxed text-base">
            {item.description}
          </p>
        )}

        {/* ── VIDEO PLAYER ── */}
        <div className="rounded-2xl overflow-hidden shadow-xl bg-black relative">
          {isPlaying && youtubeId ? (
            // Embed YouTube
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            // Thumbnail + play button
            <div className="relative aspect-video cursor-pointer group" onClick={() => youtubeId && setIsPlaying(true)}>
              <img
                src={thumb}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = imgKelas }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4">
                {youtubeId && (
                  <>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                    <span className="text-white font-bold text-xl">Youtube</span>
                  </>
                )}
                {!youtubeId && (
                  <p className="text-white/60 text-sm">Video belum tersedia</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── TOMBOL: Tonton Sekarang + Bagikan ── */}
        <div className="flex gap-3">
          <button
            onClick={() => youtubeId && setIsPlaying(true)}
            disabled={!youtubeId}
            className="flex-1 bg-[#1a7a53] text-white font-semibold py-4 rounded-xl hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            Tonton Sekarang
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            {copied ? '✓ Disalin!' : <><Share2 size={16} /> Bagikan</>}
          </button>
        </div>

        {/* ── TEMUKAN KAJIAN LAINNYA ── */}
        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Temukan Kajian Lainnya</h2>
            <Link href={`/kelas?tab=${type}`} className="text-[#1a7a53] text-sm font-semibold hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayRelated.slice(0, 6).map((rel: any, i: number) => (
              <RelatedCard key={rel.id + i} item={rel} type={type} />
            ))}
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-[#1a7a53] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs space-y-3">
            <img src={imgLogo} alt="KajianQu" className="h-12 object-contain" />
            <p className="text-gray-500 text-sm">QuranKu adalah platform islami untuk membaca Al-Qur'an, doa, dan belajar Islam dengan mudah dan nyaman.</p>
            <div className="flex gap-3">
              <img src={imgWA} alt="WA" className="w-8 h-8 object-contain cursor-pointer hover:opacity-70" />
              <img src={imgIG} alt="IG" className="w-8 h-8 object-contain cursor-pointer hover:opacity-70" />
            </div>
          </div>
          <div className="flex flex-wrap gap-12">
            <div className="space-y-2">
              <p className="font-bold text-gray-800">Tentang Kami</p>
              {['Sekilas QuranKu', 'Visi Misi', 'Ustadz'].map(l => (
                <p key={l} className="text-gray-500 text-sm hover:text-[#1a7a53] cursor-pointer">{l}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-bold text-gray-800">Kelas</p>
              {['Fiqih', 'Akhlak', 'Tahfidz', 'Akidah', 'Tafsir'].map(l => (
                <p key={l} className="text-gray-500 text-sm hover:text-[#1a7a53] cursor-pointer">{l}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-bold text-gray-800">Waktu Sholat</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}