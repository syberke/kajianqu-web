'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, CalendarClock, ExternalLink, KeyRound, Play, Share2 } from 'lucide-react'

interface ClassItem {
  id: string
  title: string
  description?: string | null
  youtube_url?: string | null
  stream_url?: string | null
  provider?: string | null
  passcode?: string | null
  starts_at?: string | null
  status?: string | null
  asatidz?: { nama?: string | null; foto_url?: string | null } | null
}

interface Props {
  item: ClassItem
  type: 'live' | 'tematik'
  relatedItems: ClassItem[]
}

function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getYouTubeThumb(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

function MediaCover({ item, compact = false }: { item: ClassItem; compact?: boolean }) {
  const source = item.youtube_url || item.stream_url || ''
  const thumb = getYouTubeThumb(source)

  if (thumb) {
    return <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
  }

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-950 to-emerald-700 text-emerald-100">
      <BookOpen size={compact ? 28 : 48} />
    </div>
  )
}

function RelatedCard({ item, type }: { item: ClassItem; type: 'live' | 'tematik' }) {
  const label = type === 'live' ? 'Live Stream' : 'Kajian Tematik'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-36 overflow-hidden"><MediaCover item={item} compact /></div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold text-emerald-700">{item.asatidz?.nama || 'Asatidz KajianQu'}</p>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{item.title}</h3>
        <p className="text-xs text-slate-500">{label}</p>
        {item.description && <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{item.description}</p>}
        <Link href={`/kelas/${type}/${item.id}`} className="inline-flex text-xs font-bold text-[#1a7a53] hover:underline">Lihat kelas</Link>
      </div>
    </article>
  )
}

export default function KelasDetailClient({ item, type, relatedItems }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const videoUrl = item.youtube_url || item.stream_url || ''
  const youtubeId = getYouTubeId(videoUrl)
  const isExternalMeeting = Boolean(videoUrl && !youtubeId)
  const breadcrumb = type === 'live' ? 'Live Stream' : 'Kajian Tematik'

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      if (navigator.share) await navigator.share({ title: item.title, url: window.location.href })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5faf8] pt-[72px]">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/kelas" className="transition hover:text-[#1a7a53]">{breadcrumb}</Link>
          <span className="text-slate-300">›</span>
          <span className="line-clamp-1 font-semibold text-slate-800">{item.title}</span>
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-700">{item.asatidz?.nama || 'Asatidz KajianQu'}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-slate-900 md:text-4xl">{item.title}</h1>
          {item.description && <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{item.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {item.starts_at && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <CalendarClock size={14} className="text-emerald-700" />
                {new Date(item.starts_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </span>
            )}
            {item.provider && <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase text-emerald-800">{item.provider}</span>}
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          {isPlaying && youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          ) : (
            <button type="button" onClick={() => youtubeId && setIsPlaying(true)} className="group relative h-full w-full" disabled={!youtubeId}>
              <MediaCover item={item} />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                {youtubeId ? (
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-2xl transition group-hover:scale-105"><Play size={25} fill="currentColor" /></span>
                ) : <span className="rounded-full bg-black/45 px-4 py-2 text-sm font-semibold text-white/80">{isExternalMeeting ? 'Pertemuan melalui tautan eksternal' : 'Video belum tersedia'}</span>}
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isExternalMeeting ? (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a7a53] py-4 font-bold text-white transition hover:bg-[#15613f]">
              Buka Pertemuan <ExternalLink size={17} />
            </a>
          ) : (
            <button type="button" onClick={() => youtubeId && setIsPlaying(true)} disabled={!youtubeId} className="flex-1 rounded-xl bg-[#1a7a53] py-4 font-bold text-white transition hover:bg-[#15613f] disabled:cursor-not-allowed disabled:opacity-50">Tonton Sekarang</button>
          )}
          <button type="button" onClick={() => void handleShare()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50">
            <Share2 size={16} /> {copied ? 'Disalin' : 'Bagikan'}
          </button>
        </div>

        {item.passcode && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <KeyRound className="shrink-0 text-amber-700" size={19} />
            <p><span className="font-black">Passcode pertemuan:</span> <span className="font-mono">{item.passcode}</span></p>
          </div>
        )}

        {relatedItems.length > 0 && (
          <section className="space-y-5 pt-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900">Temukan Kajian Lainnya</h2>
              <Link href="/kelas" className="text-sm font-semibold text-[#1a7a53] hover:underline">Lihat Semua</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {relatedItems.slice(0, 6).map((related) => <RelatedCard key={related.id} item={related} type={type} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
