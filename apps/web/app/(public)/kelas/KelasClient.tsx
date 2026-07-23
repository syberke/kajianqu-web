'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle2, Clock, LoaderCircle, MessageCircle, UserCheck, Video } from 'lucide-react'

type Tab = 'live' | 'tematik' | 'private'

interface ClassItem {
  id: string
  title: string
  description?: string | null
  youtube_url?: string | null
  stream_url?: string | null
  status?: string | null
  scheduled_at?: string | null
  asatidz?: { nama?: string | null; foto_url?: string | null } | null
}

interface Props {
  liveData: ClassItem[]
  tematikData: ClassItem[]
  privateData: {
    activeClassCount: number
    classes: Array<{
      id: string
      title: string
      description: string | null
      coverUrl: string | null
      startsAt: string | null
      capacity: number
      price: number
      asatidz: { nama: string; fotoUrl: string | null } | null
    }>
    mentors: { nama: string; bidang: string; fotoUrl: string | null }[]
  }
}

function getYouTubeThumb(url?: string | null) {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
}

function KelasCard({ item, type }: { item: ClassItem; type: 'live' | 'tematik' }) {
  const thumb = getYouTubeThumb(item.youtube_url || item.stream_url)
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-600">
        {thumb ? <img src={thumb} alt={item.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-emerald-100"><Video size={42} /></div>}
        {type === 'live' && item.status === 'live' && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black text-white">LIVE</span>}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold text-emerald-700">{item.asatidz?.nama || 'Asatidz KajianQu'}</p>
        <h3 className="mt-2 line-clamp-2 font-black text-slate-900">{item.title}</h3>
        {item.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.description}</p>}
        {item.scheduled_at && <p className="mt-2 text-xs text-slate-400">{new Date(item.scheduled_at).toLocaleString('id-ID')}</p>}
        <Link href={`/kelas/${type}/${item.id}`} className="mt-4 inline-flex font-bold text-[#1a7a53] hover:underline">Lihat kelas</Link>
      </div>
    </article>
  )
}

export default function KelasClient({ liveData, tematikData, privateData }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('live')
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [enrollmentMessage, setEnrollmentMessage] = useState('')

  const enroll = async (classId: string) => {
    setEnrolling(classId)
    setEnrollmentMessage('')
    const response = await fetch(`/api/private-classes/${classId}/enroll`, { method: 'POST' })
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent('/kelas')}`)
      return
    }
    setEnrollmentMessage(payload?.message || payload?.error || (response.ok ? 'Pendaftaran berhasil.' : 'Pendaftaran gagal.'))
    setEnrolling(null)
  }
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'live', label: 'Live Stream' },
    { id: 'tematik', label: 'Kajian Tematik' },
    { id: 'private', label: 'Kelas Private' },
  ]

  const classes = activeTab === 'live' ? liveData : tematikData

  return (
    <div className="min-h-screen bg-[#f7faf8] pt-[72px]">
      <section className="bg-[#145c42] px-6 py-20 text-center text-white"><p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">Program Kelas</p><h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black md:text-5xl">Belajar dari kelas yang benar-benar tersedia di KajianQu</h1><p className="mx-auto mt-4 max-w-2xl text-white/70">Live, kajian tematik, dan pendampingan private ditampilkan langsung dari database.</p></section>
      <div className="sticky top-[72px] z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-xl rounded-full bg-slate-100 p-1">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 rounded-full px-3 py-2.5 text-sm font-bold ${activeTab === tab.id ? 'bg-[#1a7a53] text-white shadow-sm' : 'text-slate-500'}`}>{tab.label}</button>)}</div></div>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {activeTab !== 'private' ? (
          <section><div className="mb-6"><h2 className="text-2xl font-black text-slate-900">{activeTab === 'live' ? 'Live Stream' : 'Kajian Tematik'}</h2><p className="mt-1 text-sm text-slate-500">{classes.length} kelas tersedia.</p></div>{classes.length === 0 ? <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-500"><Video className="mx-auto mb-3 text-slate-300" size={40} />Belum ada kelas pada kategori ini.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{classes.map((item) => <KelasCard key={item.id} item={item} type={activeTab} />)}</div>}</section>
        ) : (
          <section className="space-y-12">
            <div className="grid gap-6 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Pendampingan Personal</p><h2 className="mt-2 text-3xl font-black text-slate-900">Kelas Private</h2><p className="mt-3 max-w-2xl leading-relaxed text-slate-600">Program belajar langsung bersama Asatidz KajianQu. Saat ini ada {privateData.activeClassCount} ruang kelas aktif yang tercatat di sistem.</p></div><BookOpen className="text-emerald-700" size={56} /></div>
            <div><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-900">Pilih Kelas Private</h2><p className="mt-1 text-sm text-slate-500">Pendaftaran akan ditinjau oleh pengajar.</p></div>{enrollmentMessage && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} />{enrollmentMessage}</p>}</div>{privateData.classes.length === 0 ? <p className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white py-14 text-center text-slate-500">Belum ada kelas private yang tersedia.</p> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{privateData.classes.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="h-40 bg-gradient-to-br from-emerald-950 to-emerald-600">{item.coverUrl && <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />}</div><div className="p-5"><p className="text-xs font-bold text-emerald-700">{item.asatidz?.nama || 'Asatidz KajianQu'}</p><h3 className="mt-2 font-black text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description || 'Pendampingan belajar langsung bersama Asatidz.'}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">{item.startsAt && <span>{new Date(item.startsAt).toLocaleString('id-ID')}</span>}<span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}</span><span>Maks. {item.capacity} siswa</span></div><button type="button" disabled={enrolling === item.id} onClick={() => void enroll(item.id)} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white disabled:opacity-60">{enrolling === item.id && <LoaderCircle className="animate-spin" size={16} />}Daftar Kelas</button></div></article>)}</div>}</div>
            <div><h2 className="text-center text-2xl font-black text-slate-900">Asatidz Terverifikasi</h2>{privateData.mentors.length === 0 ? <p className="mt-6 text-center text-slate-500">Belum ada Asatidz terverifikasi yang tersedia.</p> : <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{privateData.mentors.map((mentor) => <article key={`${mentor.nama}-${mentor.bidang}`} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-emerald-50 font-black text-emerald-700">{mentor.fotoUrl ? <img src={mentor.fotoUrl} alt={mentor.nama} className="h-full w-full object-cover" /> : mentor.nama.slice(0, 1)}</div><p className="mt-4 font-black text-slate-900">{mentor.nama}</p><p className="mt-1 text-sm text-slate-500">{mentor.bidang}</p></article>)}</div>}</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
              { title: 'Waktu Fleksibel', desc: 'Jadwal kelas tercatat dan dapat disesuaikan bersama Asatidz.', icon: Clock },
              { title: 'Materi Terarah', desc: 'Materi dapat dipilih sesuai bidang dan kebutuhan belajar.', icon: BookOpen },
              { title: 'Diskusi Langsung', desc: 'Percakapan dengan Asatidz tersedia melalui fitur pesan.', icon: MessageCircle },
              { title: 'Asatidz Terverifikasi', desc: 'Daftar mentor berasal dari profil yang sudah disetujui admin.', icon: UserCheck },
            ].map(({ title, desc, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={22} /></span><h3 className="mt-4 font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p></article>)}</div>
          </section>
        )}
      </main>
    </div>
  )
}
