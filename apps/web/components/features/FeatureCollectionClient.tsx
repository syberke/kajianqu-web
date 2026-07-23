'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  BookOpen,
  CalendarDays,
  CircleAlert,
  Clock3,
  ExternalLink,
  HeartHandshake,
  LoaderCircle,
  MessageCircleQuestion,
  MoonStar,
  Quote,
  RefreshCw,
  Sparkles,
  Video,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type FeatureKind = 'doa' | 'dzikir' | 'quote' | 'bahtsul' | 'muamalat' | 'live' | 'achievement'
type FeatureRow = Record<string, unknown>

const featureMeta: Record<FeatureKind, {
  title: string
  subtitle: string
  eyebrow: string
  table: string
  select: string
  icon: typeof BookOpen
}> = {
  doa: {
    title: "Do'a Harian",
    subtitle: "Kumpulan do'a untuk menemani aktivitas sehari-hari.",
    eyebrow: 'IBADAH HARIAN',
    table: 'daily_prayers',
    select: 'id, title, arabic_text, transliteration, translation, virtue, reference, audio_url',
    icon: BookOpen,
  },
  dzikir: {
    title: 'Dzikir Harian',
    subtitle: 'Dzikir pagi, petang, dan umum dengan jumlah bacaan yang jelas.',
    eyebrow: 'TENANGKAN HATI',
    table: 'dhikr_items',
    select: 'id, period, title, arabic_text, transliteration, translation, repetitions, reference',
    icon: MoonStar,
  },
  quote: {
    title: 'Quote Islami',
    subtitle: 'Pengingat singkat untuk menjaga niat dan menumbuhkan kebaikan.',
    eyebrow: 'PENGINGAT HARI INI',
    table: 'quotes',
    select: 'id, content, source, publish_date',
    icon: Quote,
  },
  bahtsul: {
    title: 'Bahtsul Masail',
    subtitle: 'Ruang pembahasan masalah keislaman yang tersusun dan dapat dipelajari kembali.',
    eyebrow: 'DISKUSI KEILMUAN',
    table: 'bahtsul_topics',
    select: 'id, title, content, category, status, created_at',
    icon: MessageCircleQuestion,
  },
  muamalat: {
    title: 'Muamalat',
    subtitle: 'Pembahasan transaksi, hubungan sosial, dan kehidupan sehari-hari sesuai syariat.',
    eyebrow: 'PANDUAN MUAMALAT',
    table: 'muamalat_topics',
    select: 'id, title, content, category, status, created_at',
    icon: HeartHandshake,
  },
  live: {
    title: 'Kajian Live',
    subtitle: 'Ikuti kajian langsung dari asatidz melalui room yang telah diverifikasi.',
    eyebrow: 'JADWAL KAJIAN',
    table: 'live_events',
    select: 'id, title, description, provider, starts_at, estimated_minutes, event_url, thumbnail_url, status',
    icon: Video,
  },
  achievement: {
    title: 'Achievement',
    subtitle: 'Milestone untuk menjaga semangat belajar dan konsistensi ibadah.',
    eyebrow: 'PROGRES BELAJAR',
    table: 'achievements',
    select: 'id, code, title, description, icon, target_role',
    icon: Award,
  },
}

function stringValue(row: FeatureRow, key: string) {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}

function formatDate(value: unknown) {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

export default function FeatureCollectionClient({ kind }: { kind: FeatureKind }) {
  const meta = featureMeta[kind]
  const Icon = meta.icon
  const [rows, setRows] = useState<FeatureRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from(meta.table).select(meta.select)
      if (kind === 'doa' || kind === 'dzikir' || kind === 'quote') {
        query = query.eq('is_published', true)
      }
      if (kind === 'achievement') query = query.eq('is_active', true)
      if (kind === 'live') query = query.neq('status', 'cancelled').order('starts_at', { ascending: true })
      else if (kind === 'dzikir') query = query.order('sort_order', { ascending: true })
      else query = query.limit(48)
      const { data, error: queryError } = await query
      if (queryError) throw queryError
      setRows((data || []) as unknown as FeatureRow[])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Data belum dapat dimuat.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // `kind` is the stable identity for this collection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind])

  const emptyCopy = useMemo(() => {
    if (kind === 'live') return 'Belum ada jadwal live yang dipublikasikan.'
    return 'Konten akan muncul setelah disetujui dan dipublikasikan.'
  }, [kind])

  return (
    <div className="min-h-screen bg-[#f8fbfa] pt-[72px]">
      <section className="relative overflow-hidden rounded-b-[36px] bg-[#157a52]">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#0f5e42]/40" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative mx-auto max-w-[1240px] px-6 py-16 md:py-20">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12">
            <Icon className="text-[#d3ad0f]" size={28} />
          </div>
          <p className="text-xs font-extrabold tracking-[0.22em] text-[#d9f1e8]">{meta.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">{meta.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d9f1e8] md:text-base">{meta.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 py-12">
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[24px] border border-[#e2ebe7] bg-white">
            <LoaderCircle className="animate-spin text-[#157a52]" size={32} />
            <p className="text-sm text-gray-500">Memuat data KajianQu...</p>
          </div>
        ) : null}

        {error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[24px] border border-red-100 bg-red-50 p-8 text-center">
            <CircleAlert className="text-red-500" size={34} />
            <div>
              <h2 className="font-bold text-red-800">Data belum berhasil dimuat</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-red-600">{error}</p>
            </div>
            <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-700 shadow-sm">
              <RefreshCw size={16} /> Coba lagi
            </button>
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-[24px] border border-[#e2ebe7] bg-white p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5ef]"><Sparkles className="text-[#157a52]" /></div>
            <div>
              <h2 className="text-lg font-black text-[#153c2d]">Belum ada konten</h2>
              <p className="mt-2 text-sm text-gray-500">{emptyCopy}</p>
            </div>
          </div>
        ) : null}

        {!loading && !error && rows.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => {
              const id = String(row.id)
              const title = stringValue(row, 'title') || 'KajianQu'
              const body = stringValue(row, 'content') || stringValue(row, 'translation') || stringValue(row, 'description')
              const arabic = stringValue(row, 'arabic_text')
              const source = stringValue(row, 'source') || stringValue(row, 'reference') || stringValue(row, 'category')
              const repetitions = typeof row.repetitions === 'number' ? row.repetitions : null
              const eventUrl = stringValue(row, 'event_url')
              const date = formatDate(row.starts_at || row.publish_date || row.created_at)
              return (
                <article key={id} className="flex flex-col rounded-[22px] border border-[#e2ebe7] bg-white p-6 shadow-[0_10px_35px_rgba(14,74,52,0.06)]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5ef]"><Icon className="text-[#157a52]" size={21} /></div>
                    {date ? <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-400"><CalendarDays size={13} />{date}</span> : null}
                  </div>
                  <h2 className="text-lg font-black leading-7 text-[#153c2d]">{title}</h2>
                  {arabic ? <p dir="rtl" className="mt-5 text-right text-2xl leading-[2.1] text-[#102e23]">{arabic}</p> : null}
                  {body ? <p className="mt-4 line-clamp-6 text-sm leading-7 text-gray-600">{body}</p> : null}
                  <div className="mt-auto pt-5">
                    {source ? <p className="border-t border-gray-100 pt-4 text-xs font-semibold text-[#157a52]">{source}</p> : null}
                    {repetitions ? <p className="mt-2 text-xs font-bold text-[#936f00]">{repetitions} kali bacaan</p> : null}
                    {eventUrl ? (
                      <a href={eventUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#157a52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f5e42]">
                        {row.status === 'live' ? 'Masuk sekarang' : 'Buka room'} <ExternalLink size={15} />
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/welcome" className="rounded-full border border-[#157a52] px-5 py-2.5 text-sm font-bold text-[#157a52]">Kembali ke beranda</Link>
          <Link href="/sahabat-quran" className="rounded-full bg-[#157a52] px-5 py-2.5 text-sm font-bold text-white">Baca Al-Qur&apos;an</Link>
        </div>
      </section>
    </div>
  )
}
