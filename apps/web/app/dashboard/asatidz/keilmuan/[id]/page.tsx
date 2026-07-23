import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AlertTriangle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock3, ExternalLink, Layers3, PencilLine, Timer } from 'lucide-react'

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
    include: {
      keilmuan: { select: { nama: true } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!material) notFound()
  const editable = ['DRAFT', 'REVISION_REQUIRED', 'REJECTED'].includes(material.workflowStatus)
  const workflowLabel: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Menunggu Review',
    IN_REVIEW: 'Sedang Direview',
    REVISION_REQUIRED: 'Perlu Revisi',
    REJECTED: 'Ditolak',
    PUBLISHED: 'Dipublikasikan',
    ARCHIVED: 'Diarsipkan',
  }

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
              {material.isPublished ? <CheckCircle2 size={16} /> : material.workflowStatus === 'REVISION_REQUIRED' ? <AlertTriangle size={16} /> : <Clock3 size={16} />}
              {workflowLabel[material.workflowStatus] || material.workflowStatus}
            </span>
          </div>
        </header>

        <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          <div className="rounded-2xl bg-slate-50 p-4">
            <Layers3 size={18} className="text-emerald-700" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Bidang</p>
            <p className="mt-1 font-semibold text-slate-800">{material.keilmuan?.nama ?? 'Belum dikategorikan'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <Timer size={18} className="text-emerald-700" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Durasi Video</p>
            <p className="mt-1 font-semibold text-slate-800">{material.durationMinutes ? `${material.durationMinutes} menit` : 'Materi teks'}</p>
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

          {material.youtubeUrl && (
            <a href={material.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100">
              <ExternalLink size={17} /> Buka preview YouTube
            </a>
          )}
          {material.description && <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-slate-100 p-5 text-sm leading-7 text-slate-600">{material.description}</div>}
          {material.referencesText && <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm leading-7 text-amber-900"><p className="font-black">Referensi</p><p className="mt-1 whitespace-pre-wrap">{material.referencesText}</p></div>}

          {(material.reviewNote || material.reviews.length > 0) && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-black text-amber-900">Catatan reviewer</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">{material.reviewNote || material.reviews[0]?.note}</p>
            </div>
          )}

          {editable && (
            <Link href={`/dashboard/asatidz/keilmuan/${material.id}/edit`} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 font-bold text-white hover:bg-[#043f30]">
              <PencilLine size={17} /> {material.workflowStatus === 'REVISION_REQUIRED' ? 'Perbaiki dan kirim ulang' : 'Edit materi'}
            </Link>
          )}
        </section>
      </article>
    </div>
  )
}
