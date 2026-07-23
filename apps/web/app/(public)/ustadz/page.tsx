import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight, MessageCircle, Search, ShieldCheck, UserRound } from 'lucide-react'

import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

interface PageProps {
  searchParams: Promise<{ q?: string; bidang?: string; page?: string }>
}

export default async function UstadzPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim().slice(0, 80) ?? ''
  const bidang = params.bidang?.trim().slice(0, 80) ?? ''
  const requestedPage = Number.parseInt(params.page ?? '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const where = {
    role: 'asatidz',
    isActive: true,
    asatidzProfile: {
      approved: true,
      ...(bidang ? { bidang } : {}),
    },
    ...(query ? {
      OR: [
        { nama: { contains: query, mode: 'insensitive' as const } },
        { asatidzProfile: { approved: true, bidang: { contains: query, mode: 'insensitive' as const } } },
        { asatidzProfile: { approved: true, keahlian: { contains: query, mode: 'insensitive' as const } } },
      ],
    } : {}),
  }

  const [total, ustadz, bidangRows] = await Promise.all([
    db.profile.count({ where }),
    db.profile.findMany({
      where,
      orderBy: [{ nama: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        nama: true,
        fotoUrl: true,
        asatidzProfile: { select: { bidang: true, keahlian: true, bio: true } },
        _count: { select: { privateClassPages: true, materials: true, liveSessions: true } },
      },
    }),
    db.asatidzProfile.findMany({
      where: { approved: true, bidang: { not: null }, profile: { isActive: true } },
      distinct: ['bidang'],
      orderBy: { bidang: 'asc' },
      select: { bidang: true },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hrefForPage = (nextPage: number) => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    if (bidang) next.set('bidang', bidang)
    next.set('page', String(nextPage))
    return `/ustadz?${next.toString()}`
  }

  return (
    <main className="min-h-screen bg-[#f6faf8] pt-[72px]">
      <section className="bg-[#145c42] px-5 py-16 text-center text-white sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Pengajar KajianQu</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black sm:text-5xl">Belajar bersama ustadz terverifikasi</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/75">Lihat bidang keilmuan, kelas yang tersedia, lalu mulai percakapan langsung dari akun siswa.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <form className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_240px_auto]" action="/ustadz">
          <label className="relative">
            <span className="sr-only">Cari ustadz</span>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input name="q" defaultValue={query} placeholder="Cari nama atau keahlian..." className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-600" />
          </label>
          <select name="bidang" defaultValue={bidang} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-emerald-600">
            <option value="">Semua bidang</option>
            {bidangRows.flatMap((item) => item.bidang ? [<option key={item.bidang} value={item.bidang}>{item.bidang}</option>] : [])}
          </select>
          <button type="submit" className="h-12 rounded-2xl bg-[#1a7a53] px-7 text-sm font-black text-white hover:bg-[#126541]">Cari</button>
        </form>

        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-black text-slate-900">Daftar Ustadz</h2><p className="mt-1 text-sm text-slate-500">{total} pengajar aktif dan telah disetujui admin.</p></div>
        </div>

        {ustadz.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            <UserRound className="mx-auto mb-3 text-slate-300" size={42} />
            Tidak ada ustadz yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ustadz.map((item) => {
              const classCount = item._count.privateClassPages + item._count.materials + item._count.liveSessions
              return (
                <article key={item.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
                      {item.fotoUrl ? <img src={item.fotoUrl} alt={item.nama} className="h-full w-full object-cover" /> : item.nama.slice(0, 1)}
                    </div>
                    <div className="min-w-0"><div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700"><ShieldCheck size={15} />Terverifikasi</div><h2 className="mt-1 truncate text-lg font-black text-slate-900">{item.nama}</h2><p className="text-sm text-slate-500">{item.asatidzProfile?.bidang || 'Keilmuan Islam'}</p></div>
                  </div>
                  <p className="mt-5 line-clamp-3 min-h-[63px] text-sm leading-7 text-slate-600">{item.asatidzProfile?.bio || item.asatidzProfile?.keahlian || 'Pengajar KajianQu yang siap mendampingi proses belajar Anda.'}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500"><BookOpen size={15} className="text-emerald-700" />{classCount} kelas dan materi</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link href={`/ustadz/${item.id}`} className="grid h-11 place-items-center rounded-xl border border-emerald-700 text-sm font-black text-emerald-800 hover:bg-emerald-50">Lihat profil</Link>
                    <Link href={`/dashboard/siswa/chat?ustadz=${item.id}`} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1a7a53] text-sm font-black text-white hover:bg-[#126541]"><MessageCircle size={16} />Chat</Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {totalPages > 1 && <nav aria-label="Navigasi halaman ustadz" className="mt-10 flex items-center justify-center gap-3"><Link aria-disabled={page <= 1} href={page > 1 ? hrefForPage(page - 1) : hrefForPage(1)} className={`grid h-11 w-11 place-items-center rounded-xl border ${page <= 1 ? 'pointer-events-none border-slate-200 text-slate-300' : 'border-emerald-700 text-emerald-800'}`}><ChevronLeft size={18} /></Link><span className="text-sm font-bold text-slate-600">Halaman {Math.min(page, totalPages)} dari {totalPages}</span><Link aria-disabled={page >= totalPages} href={page < totalPages ? hrefForPage(page + 1) : hrefForPage(totalPages)} className={`grid h-11 w-11 place-items-center rounded-xl border ${page >= totalPages ? 'pointer-events-none border-slate-200 text-slate-300' : 'border-emerald-700 text-emerald-800'}`}><ChevronRight size={18} /></Link></nav>}
      </section>
    </main>
  )
}
