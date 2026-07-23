'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, Link as LinkIcon, LoaderCircle, Plus, Video } from 'lucide-react'

interface PrivateClassItem {
  id: string
  title: string
  zoomLink: string
  passcode: string
  isActive: boolean
  createdAt: string
  enrollments: Array<{ id: string; status: string; studentName: string; studentEmail: string }>
}

export default function CreatePrivateClass() {
  const [classes, setClasses] = useState<PrivateClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<PrivateClassItem | null>(null)
  const [form, setForm] = useState({ title: '', zoomLink: '', passcode: '' })

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/asatidz/private-classes', { headers: { Accept: 'application/json' } })
      const payload = (await response.json().catch(() => null)) as { classes?: PrivateClassItem[]; error?: string } | null
      if (!response.ok) setError(payload?.error ?? 'Gagal memuat kelas private')
      else setClasses(payload?.classes ?? [])
      setLoading(false)
    }
    void load()
  }, [])

  const reviewEnrollment = async (enrollmentId: string, status: 'approved' | 'rejected') => {
    const response = await fetch('/api/asatidz/private-classes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, status }),
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setError(payload?.error || 'Gagal memperbarui pendaftaran')
      return
    }
    setClasses((items) => items.map((item) => ({
      ...item,
      enrollments: item.enrollments.map((enrollment) =>
        enrollment.id === enrollmentId ? { ...enrollment, status } : enrollment,
      ),
    })))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/asatidz/private-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form),
    })
    const payload = (await response.json().catch(() => null)) as { class?: PrivateClassItem; error?: string } | null
    if (!response.ok || !payload?.class) {
      setError(payload?.error ?? 'Gagal membuat kelas private')
    } else {
      setCreated(payload.class)
      setClasses((items) => [payload.class!, ...items])
      setForm({ title: '', zoomLink: '', passcode: Math.floor(100000 + Math.random() * 900000).toString() })
    }
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Asatidz</p><h1 className="mt-2 text-3xl font-black">Kelas Private</h1><p className="mt-2 text-sm text-white/65">Buat ruang Zoom dan simpan riwayat kelas ke database.</p></section>
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {created && <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-600" /><div><p className="font-black text-emerald-900">Kelas berhasil dibuat</p><p className="mt-1 text-sm text-emerald-700">{created.title} · Kode {created.passcode}</p><a href={created.zoomLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline"><ExternalLink size={15} /> Buka Zoom</a></div></div></section>}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><Video className="text-emerald-700" /><h2 className="text-xl font-black text-slate-900">Buat Kelas Baru</h2></div>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block"><span className="text-sm font-bold text-slate-700">Materi kajian</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Akhlakul Lil Banin" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <label><span className="text-sm font-bold text-slate-700">Link Zoom</span><input required type="url" value={form.zoomLink} onChange={(event) => setForm({ ...form, zoomLink: event.target.value })} placeholder="https://zoom.us/j/..." className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
            <label><span className="text-sm font-bold text-slate-700">Kode</span><input required value={form.passcode} onChange={(event) => setForm({ ...form, passcode: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono" /></label>
          </div>
          <button type="submit" disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D794E] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Plus size={18} />}{saving ? 'Menyimpan...' : 'Buat Kelas'}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><LinkIcon className="text-emerald-700" /><h2 className="text-xl font-black text-slate-900">Riwayat Kelas</h2></div>{loading ? <div className="grid h-44 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : classes.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Belum ada kelas private.</p> : <div className="mt-5 space-y-4">{classes.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.isActive ? 'Aktif' : 'Nonaktif'}</span><span className="text-xs text-slate-400">{item.enrollments.length} pendaftar</span></div><h3 className="mt-2 font-black text-slate-900">{item.title}</h3><p className="mt-1 text-xs text-slate-500">Kode {item.passcode} · {item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}</p></div>{item.zoomLink && <a href={item.zoomLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-emerald-700"><ExternalLink size={16} /> Zoom</a>}</div>{item.enrollments.length > 0 && <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">{item.enrollments.map((enrollment) => <div key={enrollment.id} className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-slate-800">{enrollment.studentName}</p><p className="text-xs text-slate-500">{enrollment.studentEmail} · {enrollment.status}</p></div>{enrollment.status === 'pending' && <div className="flex gap-2"><button onClick={() => void reviewEnrollment(enrollment.id, 'approved')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Terima</button><button onClick={() => void reviewEnrollment(enrollment.id, 'rejected')} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Tolak</button></div>}</div>)}</div>}</article>)}</div>}</section>
    </div>
  )
}
