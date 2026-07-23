'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CalendarDays, ExternalLink, LoaderCircle, Plus, Radio, Video, X } from 'lucide-react'

interface LiveSessionItem {
  id: string
  title: string
  description: string | null
  provider: 'youtube' | 'zoom' | 'external'
  startsAt: string
  estimatedMinutes: number | null
  eventUrl: string
  passcode: string | null
  visibility: string
  status: string
}

const initialForm = {
  title: '',
  description: '',
  provider: 'youtube' as 'youtube' | 'zoom' | 'external',
  startsAt: '',
  estimatedMinutes: 60,
  eventUrl: '',
  passcode: '',
  visibility: 'public' as 'public' | 'members',
}

export default function LiveStreamingPage() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  const load = async () => {
    const response = await fetch('/api/asatidz/live-sessions', { headers: { Accept: 'application/json' } })
    const payload = (await response.json().catch(() => null)) as { sessions?: LiveSessionItem[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat jadwal live.')
    setSessions(payload?.sessions ?? [])
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat live.')).finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/asatidz/live-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...form, startsAt: new Date(form.startsAt).toISOString() }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Live gagal dijadwalkan.')
    else {
      setForm(initialForm)
      setCreating(false)
      await load()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Asatidz</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Jadwal Live</h1><p className="mt-2 text-sm text-white/65">Gunakan YouTube, Zoom, atau platform eksternal tanpa membuat streaming palsu di dalam aplikasi.</p></div>
          <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white"><Plus size={18} /> Jadwalkan Live</button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {creating && (
        <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">Jadwalkan Live</h2><button type="button" onClick={() => setCreating(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">Judul</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
            <label><span className="text-sm font-bold text-slate-700">Platform</span><select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value as typeof form.provider })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="youtube">YouTube</option><option value="zoom">Zoom</option><option value="external">Link eksternal</option></select></label>
            <label><span className="text-sm font-bold text-slate-700">Visibilitas</span><select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as typeof form.visibility })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="public">Publik</option><option value="members">Khusus member</option></select></label>
            <label><span className="text-sm font-bold text-slate-700">Jadwal mulai</span><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <label><span className="text-sm font-bold text-slate-700">Estimasi durasi (menit)</span><input required type="number" min={10} max={720} value={form.estimatedMinutes} onChange={(event) => setForm({ ...form, estimatedMinutes: Number(event.target.value) })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <label className={form.provider === 'zoom' ? '' : 'sm:col-span-2'}><span className="text-sm font-bold text-slate-700">Link acara</span><input required type="url" value={form.eventUrl} onChange={(event) => setForm({ ...form, eventUrl: event.target.value })} placeholder={form.provider === 'youtube' ? 'https://youtube.com/watch?v=...' : form.provider === 'zoom' ? 'https://zoom.us/j/...' : 'https://...'} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            {form.provider === 'zoom' && <label><span className="text-sm font-bold text-slate-700">Passcode Zoom</span><input required value={form.passcode} onChange={(event) => setForm({ ...form, passcode: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono" /></label>}
            <label className="sm:col-span-2"><span className="text-sm font-bold text-slate-700">Deskripsi</span><textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <button type="submit" disabled={saving} className="sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1D794E] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <CalendarDays size={18} />}{saving ? 'Menyimpan...' : 'Simpan Jadwal'}</button>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><Radio className="text-red-600" /><h2 className="text-xl font-black text-slate-900">Daftar Acara</h2></div>
        {loading ? <div className="grid h-52 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : sessions.length === 0 ? <div className="py-16 text-center text-sm text-slate-500"><Video className="mx-auto mb-3 text-slate-300" size={38} />Belum ada live yang dijadwalkan.</div> : (
          <div className="mt-5 space-y-3">
            {sessions.map((session) => (
              <article key={session.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${session.status === 'live' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{session.status}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">{session.provider}</span><span className="text-xs text-slate-400">{session.visibility}</span></div>
                  <h3 className="mt-2 font-black text-slate-900">{session.title}</h3>
                  {session.description && <p className="mt-1 text-sm text-slate-500">{session.description}</p>}
                  <p className="mt-2 text-xs text-slate-400">{new Date(session.startsAt).toLocaleString('id-ID')} · {session.estimatedMinutes || '-'} menit{session.passcode ? ` · Passcode ${session.passcode}` : ''}</p>
                </div>
                <a href={session.eventUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-emerald-700"><ExternalLink size={16} /> Buka</a>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
