'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, BookMarked, LoaderCircle, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

interface TagItem {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  asatidzCount: number
}

export default function ExpertiseAdminPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/admin/expertise')
    const payload = (await response.json().catch(() => null)) as { tags?: TagItem[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat tag.')
    setTags(payload?.tags ?? [])
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat tag.')).finally(() => setLoading(false))
  }, [])

  const create = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/admin/expertise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Tag gagal dibuat.')
    else {
      setForm({ name: '', description: '', sortOrder: 0 })
      await load()
    }
    setSaving(false)
  }

  const toggle = async (tag: TagItem) => {
    const response = await fetch('/api/admin/expertise', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tag.id, isActive: !tag.isActive }),
    })
    if (!response.ok) {
      setError('Status tag gagal diperbarui.')
      return
    }
    setTags((items) => items.map((item) => item.id === tag.id ? { ...item, isActive: !item.isActive } : item))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Master Data</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Tag Keilmuan</h1>
        <p className="mt-2 text-sm text-white/65">Tag aktif akan muncul pada formulir pendaftaran dan profil Asatidz.</p>
      </section>

      {error && <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><BookMarked className="text-emerald-700" /><h2 className="text-lg font-black text-slate-900">Tambah Tag</h2></div>
          <form onSubmit={create} className="mt-5 space-y-4">
            <label className="block"><span className="text-sm font-bold text-slate-700">Nama tag</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Fikih Muamalat" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">Deskripsi</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">Urutan</span><input type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <button disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] font-black text-white disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Plus size={18} />} Tambah Tag</button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-black text-slate-900">Daftar Tag</h2>
          {loading ? <div className="grid h-52 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : tags.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Belum ada tag keilmuan.</p> : (
            <div className="mt-5 space-y-3">
              {tags.map((tag) => (
                <article key={tag.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{tag.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tag.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{tag.isActive ? 'Aktif' : 'Nonaktif'}</span></div>
                    <p className="mt-1 text-sm text-slate-500">{tag.description || 'Tanpa deskripsi'}</p>
                    <p className="mt-2 text-xs text-slate-400">{tag.asatidzCount} Asatidz · Urutan {tag.sortOrder}</p>
                  </div>
                  <button type="button" onClick={() => void toggle(tag)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
                    {tag.isActive ? <ToggleRight className="text-emerald-600" /> : <ToggleLeft />} {tag.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
