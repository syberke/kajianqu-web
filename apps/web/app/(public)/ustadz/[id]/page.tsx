import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, CalendarDays, CheckCircle2, PlayCircle, ShieldCheck, Star } from 'lucide-react'

import UstadzActions, { UstadzReviewForm } from '@/components/ustadz/UstadzActions'
import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface PageProps { params: Promise<{ id: string }> }

export default async function UstadzDetailPage({ params }: PageProps) {
  const { id } = await params
  const [user, ustadz] = await Promise.all([getAuthenticatedUser(), db.profile.findFirst({
    where: { id, role: 'asatidz', isActive: true, asatidzProfile: { approved: true } },
    select: {
      id: true,
      nama: true,
      fotoUrl: true,
      asatidzProfile: { select: { bidang: true, keahlian: true, bio: true, latarBelakang: true, pengalamanMengajar: true } },
      privateClassPages: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, description: true, coverUrl: true }, take: 12 },
      liveSessions: { where: { status: { in: ['live', 'upcoming', 'ended'] } }, orderBy: { scheduledAt: 'desc' }, select: { id: true, title: true, description: true, status: true, scheduledAt: true, thumbnailUrl: true }, take: 12 },
      materials: { where: { isPublished: true, reviewStatus: 'approved' }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, summary: true, type: true, thumbnailUrl: true }, take: 12 },
    },
  })])
  if (!ustadz) notFound()

  const [reviews, savedItem, ownReview, currentProfile] = await Promise.all([
    db.review.findMany({ where: { asatidzId: ustadz.id, status: 'published' }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, rating: true, content: true, createdAt: true, reviewer: { select: { nama: true, fotoUrl: true } } } }),
    user ? db.savedItem.findFirst({ where: { userId: user.id, asatidzId: ustadz.id }, select: { id: true } }) : null,
    user ? db.review.findUnique({ where: { reviewerId_asatidzId: { reviewerId: user.id, asatidzId: ustadz.id } }, select: { rating: true, content: true } }) : null,
    user ? db.profile.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } }) : null,
  ])
  const averageRating = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0

  return (
    <main className="min-h-screen bg-[#f6faf8] pt-[72px]">
      <section className="bg-[#145c42] px-4 py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-[160px_1fr_auto] sm:items-center">
          <div className="grid h-36 w-36 place-items-center overflow-hidden rounded-[36px] bg-white/15 text-5xl font-black ring-4 ring-white/15">{ustadz.fotoUrl ? <img src={ustadz.fotoUrl} alt={ustadz.nama} className="h-full w-full object-cover" /> : ustadz.nama.slice(0, 1)}</div>
          <div><p className="flex items-center gap-2 text-sm font-bold text-emerald-200"><ShieldCheck size={18} />Ustadz terverifikasi</p><h1 className="mt-2 text-4xl font-black">{ustadz.nama}</h1><p className="mt-2 text-lg text-white/75">{ustadz.asatidzProfile?.bidang || 'Keilmuan Islam'}</p><p className="mt-4 max-w-2xl leading-7 text-white/70">{ustadz.asatidzProfile?.bio || 'Pengajar KajianQu yang siap mendampingi proses belajar Anda.'}</p></div>
          <UstadzActions ustadzId={ustadz.id} loggedIn={Boolean(user)} initialSaved={Boolean(savedItem)} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
        <section className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-xl font-black text-slate-900">Keahlian</h2><p className="mt-3 leading-7 text-slate-600">{ustadz.asatidzProfile?.keahlian || ustadz.asatidzProfile?.bidang || 'Keilmuan Islam'}</p></article>
          <article className="rounded-3xl border border-slate-200 bg-white p-7"><h2 className="text-xl font-black text-slate-900">Pengalaman mengajar</h2><p className="mt-3 leading-7 text-slate-600">{ustadz.asatidzProfile?.pengalamanMengajar || ustadz.asatidzProfile?.latarBelakang || 'Profil pengalaman sedang dilengkapi.'}</p></article>
        </section>

        <ClassSection title="Kelas private" empty="Belum ada kelas private yang dibuka." items={ustadz.privateClassPages.map((item) => ({ id: item.id, title: item.title, description: item.description, image: item.coverUrl, href: '/kelas#private', icon: BookOpen }))} />
        <ClassSection title="Jadwal live" empty="Belum ada jadwal live." items={ustadz.liveSessions.map((item) => ({ id: item.id, title: item.title, description: item.scheduledAt ? new Date(item.scheduledAt).toLocaleString('id-ID') : item.description, image: item.thumbnailUrl, href: `/kelas/live/${item.id}`, icon: CalendarDays, badge: item.status }))} />
        <ClassSection title="Materi terbit" empty="Belum ada materi yang diterbitkan." items={ustadz.materials.map((item) => ({ id: item.id, title: item.title, description: item.summary, image: item.thumbnailUrl, href: `/keilmuan/${item.id}`, icon: PlayCircle }))} />

        <section><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-900">Ulasan siswa</h2><p className="mt-1 text-sm text-slate-500">Pengalaman belajar dari siswa KajianQu.</p></div>{reviews.length > 0 && <p className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"><Star size={17} className="fill-amber-400 text-amber-400" />{averageRating.toFixed(1)} · {reviews.length} ulasan</p>}</div><UstadzReviewForm ustadzId={ustadz.id} canReview={currentProfile?.role === 'siswa' && currentProfile.isActive} initialReview={ownReview} />{reviews.length === 0 ? <p className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">Belum ada ulasan. Jadilah siswa pertama yang membagikan pengalaman.</p> : <div className="grid gap-4 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-emerald-100 font-black text-emerald-800">{review.reviewer.fotoUrl ? <img src={review.reviewer.fotoUrl} alt="" className="h-full w-full object-cover" /> : review.reviewer.nama.slice(0, 1)}</div><div><p className="font-black text-slate-900">{review.reviewer.nama}</p><div className="mt-0.5 flex">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}</div></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{review.content}</p><time className="mt-3 block text-xs text-slate-400">{review.createdAt.toLocaleDateString('id-ID')}</time></article>)}</div>}</section>
      </div>
    </main>
  )
}

interface ClassItem { id: string; title: string; description?: string | null; image?: string | null; href: string; icon: typeof BookOpen; badge?: string }

function ClassSection({ title, empty, items }: { title: string; empty: string; items: ClassItem[] }) {
  return <section><div className="mb-5 flex items-center gap-3"><CheckCircle2 className="text-emerald-700" /><h2 className="text-2xl font-black text-slate-900">{title}</h2></div>{items.length === 0 ? <p className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">{empty}</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.id} href={item.href} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="relative grid h-36 place-items-center overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-600 text-emerald-100">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <item.icon size={38} />}{item.badge && <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase text-emerald-800">{item.badge}</span>}</div><div className="p-5"><h3 className="font-black text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.description || 'Buka untuk melihat detail kelas.'}</p></div></Link>)}</div>}</section>
}
