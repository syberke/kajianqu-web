'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Bookmark, LoaderCircle, MessageCircle, Star } from 'lucide-react'

interface Props {
  ustadzId: string
  loggedIn: boolean
  initialSaved: boolean
}

interface ReviewProps {
  ustadzId: string
  canReview: boolean
  initialReview?: { rating: number; content: string } | null
}

export default function UstadzActions({ ustadzId, loggedIn, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const toggleSaved = async () => {
    if (!loggedIn) return
    setSaving(true)
    const response = await fetch('/api/saved-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType: 'asatidz', targetId: ustadzId }) })
    const payload = await response.json().catch(() => null) as { saved?: boolean; error?: string } | null
    if (response.ok) setSaved(Boolean(payload?.saved)); else setMessage(payload?.error || 'Gagal menyimpan ustadz')
    setSaving(false)
  }

  return <div><div className="flex flex-wrap gap-3">{loggedIn ? <><Link href={`/dashboard/siswa/chat?ustadz=${ustadzId}`} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#d3ad0f] px-6 text-sm font-black text-emerald-950 hover:bg-amber-300"><MessageCircle size={18} />Mulai chat</Link><button type="button" onClick={() => void toggleSaved()} disabled={saving} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 text-sm font-black text-white hover:bg-white/20">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />}{saved ? 'Tersimpan' : 'Simpan'}</button></> : <Link href={`/login?next=${encodeURIComponent(`/ustadz/${ustadzId}`)}`} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#d3ad0f] px-6 text-sm font-black text-emerald-950">Masuk untuk chat</Link>}</div>{message && <p className="mt-2 text-xs font-semibold text-red-100">{message}</p>}</div>
}

export function UstadzReviewForm({ ustadzId, canReview, initialReview }: ReviewProps) {
  const [rating, setRating] = useState(initialReview?.rating ?? 5)
  const [content, setContent] = useState(initialReview?.content ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  if (!canReview) return null

  const submitReview = async (event: FormEvent) => {
    event.preventDefault(); setSubmitting(true); setMessage('')
    const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ asatidzId: ustadzId, rating, content }) })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setMessage(response.ok ? 'Ulasan berhasil disimpan. Muat ulang halaman untuk melihat pembaruan.' : payload?.error || 'Gagal menyimpan ulasan')
    setSubmitting(false)
  }

  return <form onSubmit={submitReview} className="mb-6 rounded-3xl border border-slate-200 bg-white p-6"><h3 className="text-xl font-black text-slate-900">Bagikan ulasan</h3><div className="mt-4 flex gap-1" aria-label="Rating">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} bintang`}><Star size={25} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={3} maxLength={2000} required placeholder="Ceritakan pengalaman belajar Anda..." className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-600" /><button disabled={submitting} className="mt-3 h-11 rounded-xl bg-emerald-700 px-5 text-sm font-black text-white disabled:opacity-50">{submitting ? 'Menyimpan...' : initialReview ? 'Perbarui ulasan' : 'Kirim ulasan'}</button>{message && <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}</form>
}
