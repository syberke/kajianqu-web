'use client'

// app/(public)/kelas/[type]/[id]/KelasDetailClient.tsx
// PERHATIAN: Navbar dan footer DIHAPUS — sudah dihandle (public)/layout.tsx

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Play } from 'lucide-react'

const imgKelas = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"

interface Props {
  item:         any
  type:         'live' | 'tematik'
  relatedItems: any[]
}

function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumb(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : imgKelas
}

function RelatedCard({ item, type }: { item: any; type: 'live' | 'tematik' }) {
  const thumb  = getYouTubeThumb(item.youtube_url || item.stream_url || '')
  const ustadz = item.asatidz?.nama || 'Ustadz'
  const label  = type === 'live' ? 'Live Stream' : 'Podcast'
  const href   = `/kelas/${type}/${item.id}`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-[150px] overflow-hidden rounded-t-2xl">
        <img src={thumb} alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = imgKelas }}
        />
        <div className="absolute bottom-2 left-2">
          <span className="bg-[#1a7a53] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{ustadz}</span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.title || 'Hukumnya Tahlilan'}</h4>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#1a7a53] rounded-full" />
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2">{item.description || 'Membahas Seputar Tahlilan...'}</p>
        <Link href={href} className="inline-flex items-center gap-1 text-[#1a7a53] font-semibold text-xs hover:gap-2 transition-all">
          Ikuti Kelas <span>›</span>
        </Link>
      </div>
    </div>
  )
}

export default function KelasDetailClient({ item, type, relatedItems }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied,    setCopied]    = useState(false)

  const videoUrl   = item.youtube_url || item.stream_url || ''
  const youtubeId  = getYouTubeId(videoUrl)
  const thumb      = getYouTubeThumb(videoUrl)
  const breadcrumb = type === 'live' ? 'Live Stream' : 'Kajian Tematik'

  const dummy = Array(6).fill({
    id: 'dummy', title: 'Hukumnya Tahlilan',
    description: 'Membahas Seputar Tahlilan, dan pertan...',
    asatidz: { nama: 'Ust. Adi Hidayat' }
  })
  const displayRelated = relatedItems.length > 0 ? relatedItems : dummy

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      if (navigator.share) navigator.share({ title: item.title, url: window.location.href })
    }
  }

  return (
    // pt-[72px] karena navbar fixed height 72px
    <div className="bg-[#f5faf8] min-h-screen pt-[72px] font-['Poppins',sans-serif]">
      <div className="max-w-[860px] mx-auto px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/kelas" className="hover:text-[#1a7a53] transition-colors">{breadcrumb}</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-semibold line-clamp-1">{item.title || 'Hukumnya Tahlilan'}</span>
        </div>

        {/* Judul */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {item.title || 'Hukumnya Tahlilan Bersama Ust. Adi Hidayat'}
        </h1>

        {/* Deskripsi panjang (hanya tematik) */}
        {type === 'tematik' && item.description && (
          <p className="text-gray-600 leading-relaxed text-base">{item.description}</p>
        )}

        {/* Video Player */}
        <div className="rounded-2xl overflow-hidden shadow-xl bg-black relative">
          {isPlaying && youtubeId ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative aspect-video cursor-pointer group" onClick={() => youtubeId && setIsPlaying(true)}>
              <img src={thumb} alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = imgKelas }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4">
                {youtubeId ? (
                  <>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                    <span className="text-white font-bold text-xl">Youtube</span>
                  </>
                ) : (
                  <p className="text-white/60 text-sm">Video belum tersedia</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Tonton + Bagikan */}
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

        {/* Related */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Temukan Kajian Lainnya</h2>
            <Link href="/kelas" className="text-[#1a7a53] text-sm font-semibold hover:underline">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayRelated.slice(0, 6).map((rel: any, i: number) => (
              <RelatedCard key={rel.id + i} item={rel} type={type} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}