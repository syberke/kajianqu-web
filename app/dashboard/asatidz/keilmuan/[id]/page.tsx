import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock3, Layers3 } from 'lucide-react'

import { requireAsatidz } from '@/lib/auth/require-asatidz'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AsatidzMaterialDetailPage({ params }: Props) {
  const user = await requireAsatidz()
  if (!user) redirect('/login')

  const { id } = await params
  const material = await db.material.findFirst({
    where: { id, asatidzId: user.id },
    include: { keilmuan: { select: { nama: true } } },
  })

  if (!material) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/asatidz/keilmuan" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
        <ArrowLeft size={17} /> Kembali ke materi
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="bg-[#064E3B] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Detail Materi</p>
              <h1 className="mt-3 text-3xl font-black leading-tight">{material.title}</h1>
              <p className="mt-2 text-sm text-emerald-100/70">/{material.slug}</p>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              material.isPublished ? 'bg-emerald-400/15 text-emerald-100' : 'bg-amber-300/15 text-amber-100'
            }`}>
              {material.isPublished ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
              {material.isPublished ? 'Dipublikasikan' : 'Draft'}
            </span>
          </div>
        </header>

        <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-3 sm:p-8">
          <div className="rounded-2xl bg-slate-50 p-4">
            <Layers3 size={18} className="text-emerald-700" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Bidang</p>
            <p className="mt-1 font-semibold text-slate-800">{material.keilmuan?.nama ?? 'Belum dikategorikan'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <BookOpen size={18} className="text-emerald-700" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Jenis</p>
            <p className="mt-1 font-semibold text-slate-800">{material.type === 'kajian_tematik' ? 'Kajian Tematik' : 'Materi'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <CalendarDays size={18} className="text-emerald-700" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Dibuat</p>
            <p className="mt-1 font-semibold text-slate-800">{material.createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <section className="p-6 sm:p-8">
          <h2 className="text-lg font-black text-slate-900">Ringkasan</h2>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-[#fbfdfc] p-5 text-sm leading-7 text-slate-600">
            {material.summary?.trim() || 'Materi ini belum memiliki ringkasan.'}
          </div>
        </section>
      </article>
    </div>
  )
}
