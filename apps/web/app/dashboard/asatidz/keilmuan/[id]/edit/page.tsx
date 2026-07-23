'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, LoaderCircle, Save, Send } from 'lucide-react'

import { MateriService } from '@/service/materi'

interface MaterialData {
  title: string
  summary: string | null
  description: string | null
  youtubeUrl: string | null
  durationMinutes: number | null
  referencesText: string | null
  type: string
  keilmuanId: string | null
}

export default function EditAsatidzMaterialPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [material, setMaterial] = useState<MaterialData | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; nama: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitForReview, setSubmitForReview] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [materialResponse, categoryResponse] = await Promise.all([
        fetch(`/api/asatidz/materials/${encodeURIComponent(params.id)}`),
        fetch('/api/keilmuan'),
      ])
      const materialPayload = (await materialResponse.json().catch(() => null)) as { material?: MaterialData; error?: string } | null
      const categoryPayload = (await categoryResponse.json().catch(() => null)) as { keilmuan?: Array<{ id: string; nama: string }> } | null
      if (!materialResponse.ok || !materialPayload?.material) throw new Error(materialPayload?.error || 'Materi tidak ditemukan.')
      setMaterial(materialPayload.material)
      setCategories(categoryPayload?.keilmuan ?? [])
      setLoading(false)
    }
    void load().catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat materi.')
      setLoading(false)
    })
  }, [params.id])

  const update = <K extends keyof MaterialData>(key: K, value: MaterialData[K]) => {
    setMaterial((current) => current ? { ...current, [key]: value } : current)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!material) return
    setSaving(true)
    setError('')
    try {
      await MateriService.updateAsatidzMaterial(params.id, {
        title: material.title,
        summary: material.summary || '',
        description: material.description || '',
        youtubeUrl: material.youtubeUrl || '',
        durationMinutes: material.youtubeUrl ? material.durationMinutes || 30 : undefined,
        referencesText: material.referencesText || '',
        type: material.type,
        keilmuanId: material.keilmuanId || undefined,
        submitForReview,
      })
      router.push(`/dashboard/asatidz/keilmuan/${params.id}`)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memperbarui materi.')
      setSaving(false)
    }
  }

  if (loading) return <div className="grid min-h-80 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" size={30} /></div>
  if (!material) return <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">{error || 'Materi tidak ditemukan.'}</div>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/dashboard/asatidz/keilmuan/${params.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"><ArrowLeft size={17} /> Kembali ke detail</Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-slate-900">Perbaiki Materi</h1>
        <p className="mt-2 text-sm text-slate-500">Simpan kembali sebagai draft atau kirim ulang setelah semua catatan reviewer diperbaiki.</p>
        {error && <div className="mt-5 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block"><span className="text-sm font-bold text-slate-700">Judul</span><input required maxLength={160} value={material.title} onChange={(event) => update('title', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="text-sm font-bold text-slate-700">Bidang keilmuan</span><select value={material.keilmuanId || ''} onChange={(event) => update('keilmuanId', event.target.value || null)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="">Belum dikategorikan</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label>
            <label><span className="text-sm font-bold text-slate-700">Jenis</span><select value={material.type} onChange={(event) => update('type', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="materi">Materi</option><option value="kajian_tematik">Kajian tematik</option></select></label>
          </div>
          <label className="block"><span className="text-sm font-bold text-slate-700">Ringkasan</span><textarea rows={5} value={material.summary || ''} onChange={(event) => update('summary', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]">
            <label><span className="text-sm font-bold text-slate-700">Link YouTube</span><input type="url" value={material.youtubeUrl || ''} onChange={(event) => update('youtubeUrl', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <label><span className="text-sm font-bold text-slate-700">Durasi menit</span><input type="number" min={30} max={720} disabled={!material.youtubeUrl} value={material.durationMinutes || 30} onChange={(event) => update('durationMinutes', Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 disabled:bg-slate-50" /></label>
          </div>
          <label className="block"><span className="text-sm font-bold text-slate-700">Materi teks</span><textarea rows={10} value={material.description || ''} onChange={(event) => update('description', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          <label className="block"><span className="text-sm font-bold text-slate-700">Referensi</span><textarea rows={4} value={material.referencesText || ''} onChange={(event) => update('referencesText', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="submit" onClick={() => setSubmitForReview(false)} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 font-bold text-emerald-700 disabled:opacity-60"><Save size={18} /> Simpan Draft</button>
            <button type="submit" onClick={() => setSubmitForReview(true)} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />} Kirim Ulang</button>
          </div>
        </form>
      </section>
    </div>
  )
}
