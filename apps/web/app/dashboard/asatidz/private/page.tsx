'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  ExternalLink,
  LoaderCircle,
  MessageSquare,
  Plus,
  Users,
  Video,
} from 'lucide-react'

interface PrivateClassItem {
  id: string
  title: string
  description: string | null
  capacity: number
  price: number
  startsAt: string | null
  endsAt: string | null
  registrationStatus: string
  rules: string | null
  createdAt: string
  roomId: string | null
  session: {
    id: string
    title: string
    startsAt: string
    durationMinutes: number
    zoomLink: string | null
    meetingId: string | null
    passcode: string | null
  } | null
  enrollments: Array<{
    classId: string
    userId: string
    status: string
    studentName: string
    joinedAt: string | null
  }>
}

const initialForm = {
  title: '',
  description: '',
  capacity: 20,
  price: 0,
  startsAt: '',
  endsAt: '',
  sessionTitle: 'Pertemuan 1',
  durationMinutes: 60,
  zoomLink: '',
  meetingId: '',
  passcode: '',
  rules: '',
}

export default function PrivateClassPage() {
  const [classes, setClasses] = useState<PrivateClassItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/asatidz/private-classes', { headers: { Accept: 'application/json' } })
    const payload = (await response.json().catch(() => null)) as { classes?: PrivateClassItem[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat kelas private.')
    setClasses(payload?.classes ?? [])
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat kelas.')).finally(() => setLoading(false))
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/asatidz/private-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Kelas gagal dibuat.')
    else {
      setForm(initialForm)
      await load()
    }
    setSaving(false)
  }

  const reviewMember = async (classId: string, userId: string, status: 'active' | 'rejected') => {
    const response = await fetch('/api/asatidz/private-classes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, userId, status }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Status siswa gagal diperbarui.')
    else await load()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Asatidz</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Kelas Private</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Buat jadwal kelas, simpan link Zoom, meeting ID dan passcode, kelola peserta, serta gunakan chat grup khusus anggota.</p>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><Video className="text-emerald-700" /><h2 className="text-xl font-black text-slate-900">Buat Kelas Baru</h2></div>
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Nama kelas" value={form.title} required onChange={(value) => setForm({ ...form, title: value })} placeholder="Contoh: Fikih Muamalat Dasar" />
            <Field label="Judul pertemuan pertama" value={form.sessionTitle} required onChange={(value) => setForm({ ...form, sessionTitle: value })} />
          </div>
          <label className="block"><span className="text-sm font-bold text-slate-700">Deskripsi kelas</span><textarea required rows={4} minLength={10} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /></label>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DateField label="Mulai" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} />
            <DateField label="Selesai" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} />
            <NumberField label="Kapasitas" min={1} max={500} value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} />
            <NumberField label="Harga (Rp)" min={0} max={100_000_000} value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_200px_180px]">
            <Field label="Link Zoom" type="url" value={form.zoomLink} required onChange={(value) => setForm({ ...form, zoomLink: value })} placeholder="https://zoom.us/j/..." />
            <Field label="Meeting ID" value={form.meetingId} required onChange={(value) => setForm({ ...form, meetingId: value })} />
            <Field label="Passcode" value={form.passcode} required onChange={(value) => setForm({ ...form, passcode: value })} />
          </div>
          <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
            <NumberField label="Durasi (menit)" min={30} max={480} value={form.durationMinutes} onChange={(value) => setForm({ ...form, durationMinutes: value })} />
            <Field label="Aturan singkat" value={form.rules} onChange={(value) => setForm({ ...form, rules: value })} placeholder="Adab kelas, ketentuan rekaman, dan lainnya" />
          </div>
          <button type="submit" disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D794E] font-bold text-white disabled:opacity-60 sm:w-auto sm:px-7">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Plus size={18} />}{saving ? 'Menyimpan...' : 'Buat Kelas & Grup Chat'}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3"><Users className="text-emerald-700" /><h2 className="text-xl font-black text-slate-900">Kelas Saya</h2></div>
        {loading ? <div className="grid h-52 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : classes.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Belum ada kelas private.</p> : (
          <div className="mt-5 space-y-5">
            {classes.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{item.registrationStatus}</span><span className="text-xs text-slate-400">{item.enrollments.length}/{item.capacity} peserta</span></div>
                      <h3 className="mt-3 text-lg font-black text-slate-900">{item.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{item.description}</p>
                      <p className="mt-3 text-xs font-bold text-slate-500">{item.startsAt ? new Date(item.startsAt).toLocaleString('id-ID') : 'Jadwal belum ada'} · {currency(item.price)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.roomId && <Link href={`/chat/class/${item.roomId}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><MessageSquare size={16} /> Chat Grup</Link>}
                      {item.session?.zoomLink && <a href={item.session.zoomLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-emerald-700"><ExternalLink size={16} /> Buka Zoom</a>}
                    </div>
                  </div>

                  {item.session && (
                    <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
                      <Detail label="Pertemuan" value={item.session.title} />
                      <Detail label="Jadwal" value={new Date(item.session.startsAt).toLocaleString('id-ID')} />
                      <Detail label="Meeting ID" value={item.session.meetingId || '-'} mono />
                      <Detail label="Passcode" value={item.session.passcode || '-'} mono />
                    </div>
                  )}
                </div>

                {item.enrollments.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Pendaftaran Siswa</h4>
                    <div className="mt-3 space-y-2">
                      {item.enrollments.map((member) => (
                        <div key={`${member.classId}:${member.userId}`} className="flex flex-col justify-between gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center">
                          <div><p className="text-sm font-bold text-slate-800">{member.studentName}</p><p className="text-xs text-slate-500">{member.status}</p></div>
                          {member.status === 'pending' && <div className="flex gap-2"><button type="button" onClick={() => void reviewMember(item.id, member.userId, 'active')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Terima</button><button type="button" onClick={() => void reviewMember(item.id, member.userId, 'rejected')} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Tolak</button></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Field({ label, value, onChange, required, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; type?: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="flex items-center gap-2 text-sm font-bold text-slate-700"><CalendarClock size={16} />{label}</span><input required type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3" /></label>
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number }) {
  return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><input required type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className={`mt-1 text-sm font-bold text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p></div>
}

function currency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
