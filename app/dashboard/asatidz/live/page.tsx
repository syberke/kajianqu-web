'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CalendarDays, ExternalLink, LoaderCircle, Plus, Video, X, Youtube } from 'lucide-react'

interface LiveSessionItem {
  id: string
  title: string
  description: string | null
  youtubeUrl: string | null
  streamUrl: string | null
  status: string | null
  scheduledAt: string | null
}

export default function LiveStreamingPage() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', youtubeUrl: '', scheduledAt: '' })

  const load = async () => {
    const response = await fetch('/api/asatidz/live-sessions', { headers: { Accept: 'application/json' } })
    const payload = (await response.json().catch(() => null)) as { sessions?: LiveSessionItem[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error ?? 'Gagal memuat live session')
    setSessions(payload?.sessions ?? [])
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat live session')).finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/asatidz/live-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(form),
    })
    const payload = (await response.json().catch(() => null)) as { session?: LiveSessionItem; error?: string } | null
    if (!response.ok || !payload?.session) {
      setError(payload?.error ?? 'Gagal menjadwalkan live')
    } else {
      setSessions((items) => [payload.session!, ...items])
      setForm({ title: '', description: '', youtubeUrl: '', scheduledAt: '' })
      setCreating(false)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Asatidz</p><h1 className="mt-2 text-3xl font-black">Live Streaming</h1><p className="mt-2 text-sm text-white/65">Jadwalkan tautan YouTube publik dan tampilkan sesi nyata ke santri.</p></div>
          <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white"><Plus size={18} /> Jadwalkan Live</button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {creating && (
        <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">Jadwalkan Live</h2><button type="button" onClick={() => setCreating(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">Judul</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
            <label><span className="text-sm font-bold text-slate-700">Jadwal</span><input required type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <label><span className="text-sm font-bold text-slate-700">Link YouTube</span><input type="url" value={form.youtubeUrl} onChange={(event) => setForm({ ...form, youtubeUrl: event.target.value })} placeholder="https://youtube.com/watch?v=..." className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">Deskripsi</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <button type="submit" disabled={saving} className="sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1D794E] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <CalendarDays size={18} />}{saving ? 'Menyimpan...' : 'Simpan Jadwal'}</button>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><Youtube className="text-red-600" /><h2 className="text-xl font-black text-slate-900">Daftar Live Stream</h2></div>
        {loading ? <div className="grid h-52 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : sessions.length === 0 ? <div className="py-16 text-center text-sm text-slate-500"><Video className="mx-auto mb-3 text-slate-300" size={38} />Belum ada live session yang dijadwalkan.</div> : (
          <div className="mt-5 space-y-3">{sessions.map((session) => {
            const href = session.youtubeUrl || session.streamUrl
            return <article key={session.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${session.status === 'live' ? 'bg-red-50 text-red-600' : session.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{session.status || 'scheduled'}</span></div><h3 className="mt-2 font-black text-slate-900">{session.title}</h3>{session.description && <p className="mt-1 text-sm text-slate-500">{session.description}</p>}<p className="mt-2 text-xs text-slate-400">{session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('id-ID') : 'Jadwal belum ditentukan'}</p></div>{href && <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-emerald-700"><ExternalLink size={16} /> Buka</a>}</article>
          })}</div>
        )}
      </section>
    </div>
  )
}
