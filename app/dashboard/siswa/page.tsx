import Link from 'next/link'
import { BookOpen, Bot, CheckCircle2, ChevronRight, HandCoins, Layers3, Sparkles } from 'lucide-react'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function SiswaDashboardPage() {
  const { user, profile } = await requireRole('siswa')
  const [enrollments, donationTotal, lastQuranSession, materials] = await Promise.all([
    db.privateClassEnrollment.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { class: { select: { title: true } } },
      take: 4,
    }),
    db.donation.aggregate({ where: { userId: user.id, paymentStatus: 'paid' }, _sum: { nominal: true } }),
    db.quranSession.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    db.material.findMany({
      where: { isPublished: true, reviewStatus: 'approved' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, summary: true, level: true, keilmuan: { select: { nama: true } } },
      take: 3,
    }),
  ])

  const firstName = profile?.nama.split(/\s+/)[0] || 'Sahabat'
  const donated = Number(donationTotal._sum.nominal || 0)

  return <div className="mx-auto max-w-7xl space-y-8">
    <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#064E3B] to-[#16805a] p-8 text-white shadow-xl sm:p-10"><div className="relative z-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">Ahlan wa sahlan, {firstName}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Lanjutkan perjalanan belajar Al-Qur&apos;an hari ini.</h1><p className="mt-4 text-white/70">Latihan bacaan, pelajari materi, dan ikuti kelas dari satu dashboard yang terhubung ke progresmu.</p><Link href="/quran-ai" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-black text-emerald-900"><Sparkles size={18} />Mulai Ngaji</Link></div><Bot className="absolute -bottom-8 right-8 text-white/10" size={210} /></section>
    <div className="grid gap-4 sm:grid-cols-3"><Stat icon={Bot} label="Akurasi terakhir" value={lastQuranSession ? `${Math.round(Number(lastQuranSession.accuracy))}%` : 'Belum ada'} /><Stat icon={Layers3} label="Kelas diikuti" value={String(enrollments.length)} /><Stat icon={HandCoins} label="Donasi terverifikasi" value={`Rp ${donated.toLocaleString('id-ID')}`} /></div>
    <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black text-slate-900">Materi terbaru</h2><p className="mt-1 text-sm text-slate-500">Materi yang sudah ditinjau admin.</p></div><Link href="/keilmuan" className="text-sm font-bold text-emerald-700">Lihat semua</Link></div><div className="mt-6 space-y-3">{materials.length === 0 ? <p className="rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500">Belum ada materi tersedia.</p> : materials.map((material) => <Link key={material.id} href={`/keilmuan/${material.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><BookOpen size={22} /></span><span className="min-w-0 flex-1"><span className="text-xs font-bold text-emerald-700">{material.keilmuan?.nama || 'Kajian Umum'}{material.level ? ` · ${material.level}` : ''}</span><span className="mt-1 block truncate font-black text-slate-900">{material.title}</span></span><ChevronRight className="text-slate-300" /></Link>)}</div></section>
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black text-slate-900">Kelas saya</h2><p className="mt-1 text-sm text-slate-500">Status pendaftaran private.</p><div className="mt-6 space-y-3">{enrollments.length === 0 ? <div className="py-12 text-center"><Layers3 className="mx-auto text-slate-300" /><p className="mt-3 text-sm text-slate-500">Belum mengikuti kelas.</p><Link href="/kelas" className="mt-4 inline-block text-sm font-bold text-emerald-700">Cari kelas</Link></div> : enrollments.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-black text-slate-900">{item.class.title}</p><CheckCircle2 size={17} className={item.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'} /></div><p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">{item.status}</p></div>)}</div></section>
    </div>
  </div>
}

function Stat({ icon: Icon, label, value }: { icon: typeof Bot; label: string; value: string }) {
  return <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={20} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p><p className="mt-2 text-xl font-black text-slate-900">{value}</p></article>
}
