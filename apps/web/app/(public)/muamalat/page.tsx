'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, HeartHandshake, LoaderCircle, MessageCircleQuestion, Send } from 'lucide-react'

interface Topic {
  id: string
  title: string
  content: string
  category: string | null
  status: string
  createdAt: string
  author: { name: string; role: string }
  answers: Array<{
    id: string
    content: string
    isOfficial: boolean
    createdAt: string
    author: { name: string; role: string }
  }>
}

export default function MuamalatPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [form, setForm] = useState({ title: '', content: '', category: 'Jual Beli' })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    const response = await fetch('/api/muamalat')
    const payload = (await response.json().catch(() => null)) as { topics?: Topic[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat diskusi.')
    setTopics(payload?.topics ?? [])
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat diskusi.')).finally(() => setLoading(false))
  }, [])

  const createTopic = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const response = await fetch('/api/muamalat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'topic', ...form }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (response.status === 401) setError('Silakan masuk terlebih dahulu untuk mengirim pertanyaan.')
    else if (!response.ok) setError(payload?.error || 'Pertanyaan gagal dikirim.')
    else {
      setForm({ title: '', content: '', category: 'Jual Beli' })
      setSuccess('Pertanyaan berhasil diterbitkan.')
      await load()
    }
    setSaving(false)
  }

  const answer = async (topicId: string) => {
    const content = answers[topicId]?.trim()
    if (!content) return
    setSaving(true)
    setError('')
    const response = await fetch('/api/muamalat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'answer', topicId, content }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (response.status === 401) setError('Silakan masuk terlebih dahulu untuk menjawab.')
    else if (!response.ok) setError(payload?.error || 'Jawaban gagal dikirim.')
    else {
      setAnswers({ ...answers, [topicId]: '' })
      await load()
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#f8fbfa] pt-[72px]">
      <section className="relative overflow-hidden rounded-b-[36px] bg-[#157a52]">
        <div className="relative mx-auto max-w-[1240px] px-6 py-16 md:py-20">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><HeartHandshake className="text-[#d3ad0f]" size={28} /></div>
          <p className="text-xs font-extrabold tracking-[0.22em] text-[#d9f1e8]">PANDUAN MUAMALAT</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">Muamalat</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d9f1e8] md:text-base">Diskusi tata cara hubungan, transaksi, jual beli, sewa, utang piutang, dan aktivitas sehari-hari yang bebas riba, gharar, serta maisir. Jawaban Asatidz terverifikasi ditandai sebagai jawaban resmi.</p>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="h-fit rounded-3xl border border-[#e2ebe7] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-3"><MessageCircleQuestion className="text-[#157a52]" /><h2 className="text-lg font-black text-[#153c2d]">Ajukan Pertanyaan</h2></div>
          <form onSubmit={createTopic} className="mt-5 space-y-4">
            <label className="block"><span className="text-sm font-bold text-slate-700">Kategori</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option>Jual Beli</option><option>Utang Piutang</option><option>Sewa Menyewa</option><option>Perbankan Syariah</option><option>Lainnya</option></select></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">Judul</span><input required minLength={5} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-500" /></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">Pertanyaan</span><textarea required minLength={10} rows={6} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500" /></label>
            <button disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#157a52] font-black text-white disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />} Kirim Pertanyaan</button>
          </form>
        </section>

        <section className="space-y-5">
          {error && <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}
          {success && <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 size={18} />{success}</div>}
          {loading ? <div className="grid h-72 place-items-center rounded-3xl bg-white"><LoaderCircle className="animate-spin text-emerald-700" /></div> : topics.length === 0 ? <p className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-500">Belum ada topik muamalat.</p> : topics.map((topic) => (
            <article key={topic.id} className="rounded-3xl border border-[#e2ebe7] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{topic.category || 'Muamalat'}</span><span className="text-xs text-slate-400">{new Date(topic.createdAt).toLocaleDateString('id-ID')}</span></div>
              <h2 className="mt-3 text-xl font-black text-[#153c2d]">{topic.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{topic.content}</p>
              <p className="mt-3 text-xs font-bold text-slate-400">Ditanyakan oleh {topic.author.name} · {topic.author.role}</p>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Jawaban & Pendapat</h3>
                {topic.answers.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada jawaban.</p> : topic.answers.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-4 ${item.isOfficial ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-slate-800">{item.author.name}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${item.isOfficial ? 'bg-[#157a52] text-white' : 'bg-slate-200 text-slate-600'}`}>{item.isOfficial ? 'Jawaban Asatidz' : 'Pendapat Siswa'}</span></div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.content}</p>
                  </div>
                ))}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea rows={2} value={answers[topic.id] ?? ''} onChange={(event) => setAnswers({ ...answers, [topic.id]: event.target.value })} placeholder="Tulis jawaban atau pendapat..." className="min-h-12 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                  <button type="button" onClick={() => void answer(topic.id)} disabled={saving || !answers[topic.id]?.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#157a52] px-5 text-sm font-black text-white disabled:opacity-40"><Send size={16} /> Kirim</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
