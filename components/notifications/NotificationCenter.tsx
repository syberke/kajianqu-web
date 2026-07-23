'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, CheckCheck, LoaderCircle, MessageCircle } from 'lucide-react'

interface NotificationItem { id: string; type: string | null; title: string; message: string; actionUrl: string | null; isRead: boolean; createdAt: string }

export default function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/notifications', { headers: { Accept: 'application/json' } })
    const payload = await response.json().catch(() => null) as { notifications?: NotificationItem[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat notifikasi')
    setItems(payload?.notifications ?? [])
  }

  useEffect(() => { void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat notifikasi')).finally(() => setLoading(false)) }, [])

  const markRead = async (id?: string) => {
    const response = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? { id } : { all: true }) })
    if (!response.ok) return
    setItems((current) => current.map((item) => !id || item.id === id ? { ...item, isRead: true } : item))
  }

  return <section className="mx-auto max-w-4xl"><div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-black text-slate-900">Notifikasi</h1><p className="mt-1 text-sm text-slate-500">Pembaruan kelas, pesan, dan aktivitas akun.</p></div><button type="button" onClick={() => void markRead()} disabled={!items.some((item) => !item.isRead)} className="flex h-11 items-center gap-2 rounded-xl border border-emerald-700 px-4 text-sm font-black text-emerald-800 disabled:opacity-40"><CheckCheck size={17} />Tandai semua dibaca</button></div>{error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{loading ? <div className="grid h-48 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : items.length === 0 ? <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-500"><Bell className="mx-auto mb-3 text-slate-300" size={40} />Belum ada notifikasi.</div> : <div className="space-y-3">{items.map((item) => { const content = <article className={`flex gap-4 rounded-2xl border p-5 transition ${item.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/60'}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.type === 'chat' ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-700'}`}>{item.type === 'chat' ? <MessageCircle size={20} /> : <Bell size={20} />}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="font-black text-slate-900">{item.title}</h2>{!item.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />}</div><p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p><time className="mt-2 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('id-ID')}</time></div></article>; return item.actionUrl ? <Link key={item.id} href={item.actionUrl} onClick={() => void markRead(item.id)}>{content}</Link> : <button key={item.id} type="button" onClick={() => void markRead(item.id)} className="w-full text-left">{content}</button> })}</div>}</section>
}
