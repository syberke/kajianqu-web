'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, BookOpen, LoaderCircle, Save, Send, Youtube } from 'lucide-react'

import { MateriService } from '../../../../../service/materi'

interface KeilmuanOption {
  id: string
  nama: string
}

export default function CreateAsatidzMaterialPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [referencesText, setReferencesText] = useState('')
  const [type, setType] = useState('materi')
  const [keilmuanId, setKeilmuanId] = useState('')
  const [categories, setCategories] = useState<KeilmuanOption[]>([])
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitForReview, setSubmitForReview] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadCategories = async () => {
      const response = await fetch('/api/keilmuan', { headers: { Accept: 'application/json' } })
      if (!response.ok || cancelled) return
      const payload = (await response.json()) as { keilmuan?: KeilmuanOption[] }
      setCategories(payload.keilmuan ?? [])
    }
    void loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSaving(true)

    try {
      const material = await MateriService.createAsatidzMaterial({
        title,
        summary,
        description,
        youtubeUrl,
        durationMinutes: youtubeUrl ? durationMinutes : undefined,
        referencesText,
        type,
        keilmuanId: keilmuanId || undefined,
        submitForReview,
      })
      router.push(`/dashboard/asatidz/keilmuan/${material.id}`)
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal membuat materi')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/asatidz/keilmuan" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
        <ArrowLeft size={17} /> Kembali ke materi
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><BookOpen size={22} /></span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Buat Materi Baru</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">Simpan sebagai draft atau kirim untuk review. Video wajib berdurasi minimal 30 menit.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Judul materi</span>
            <input
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Pengantar Fikih Thaharah"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Bidang keilmuan</span>
              <select
                value={keilmuanId}
                onChange={(event) => setKeilmuanId(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-emerald-500"
              >
                <option value="">Belum dikategorikan</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.nama}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Jenis materi</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-emerald-500"
              >
                <option value="materi">Materi</option>
                <option value="kajian_tematik">Kajian tematik</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Ringkasan</span>
            <textarea
              rows={7}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Tulis ringkasan materi yang akan dipelajari..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-relaxed outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-700"><Youtube size={17} className="text-red-600" /> Link YouTube</span>
              <input type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Durasi (menit)</span>
              <input type="number" min={30} max={720} required={Boolean(youtubeUrl)} disabled={!youtubeUrl} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 disabled:bg-slate-50" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Materi teks / transkrip</span>
            <textarea rows={10} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tulis materi teks jika tersedia. Salah satu dari video atau materi teks wajib diisi." className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-relaxed outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Referensi</span>
            <textarea rows={4} value={referencesText} onChange={(event) => setReferencesText(event.target.value)} placeholder="Kitab, dalil, atau sumber pendukung..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-relaxed outline-none focus:border-emerald-500" />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link href="/dashboard/asatidz/keilmuan" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 font-semibold text-slate-600 hover:bg-slate-50">Batal</Link>
            <button
              type="submit"
              onClick={() => setSubmitForReview(false)}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 font-bold text-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <button type="submit" onClick={() => setSubmitForReview(true)} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 font-bold text-white transition hover:bg-[#043f30] disabled:opacity-60">
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}
              Kirim untuk Review
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
