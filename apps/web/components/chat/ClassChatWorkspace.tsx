'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LoaderCircle, MessageSquare, Pin, RefreshCw, Send } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

interface MessageItem {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  content: string | null
  isPinned: boolean
  createdAt: string
}

export default function ClassChatWorkspace({ roomId }: { roomId: string }) {
  const [roomTitle, setRoomTitle] = useState('Chat Kelas')
  const [currentUserId, setCurrentUserId] = useState('')
  const [canModerate, setCanModerate] = useState(false)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    const response = await fetch(`/api/class-chat/${encodeURIComponent(roomId)}`, { headers: { Accept: 'application/json' } })
    const payload = (await response.json().catch(() => null)) as {
      room?: { title: string }
      currentUserId?: string
      canModerate?: boolean
      messages?: MessageItem[]
      error?: string
    } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat chat kelas.')
    setRoomTitle(payload?.room?.title || 'Chat Kelas')
    setCurrentUserId(payload?.currentUserId || '')
    setCanModerate(Boolean(payload?.canModerate))
    setMessages(payload?.messages ?? [])
    if (!quiet) setLoading(false)
  }, [roomId])

  useEffect(() => {
    void load().catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat chat.')
      setLoading(false)
    })
    const channel = supabase
      .channel(`class-chat:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, () => {
        void load(true).catch(() => undefined)
      })
      .subscribe()
    const fallbackTimer = window.setInterval(() => void load(true).catch(() => undefined), 30_000)
    return () => {
      window.clearInterval(fallbackTimer)
      void supabase.removeChannel(channel)
    }
  }, [load])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const pinned = useMemo(() => messages.filter((message) => message.isPinned), [messages])

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    setError('')
    const response = await fetch(`/api/class-chat/${encodeURIComponent(roomId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Pesan gagal dikirim.')
    else {
      setDraft('')
      await load(true)
    }
    setSending(false)
  }

  const togglePin = async (message: MessageItem) => {
    const response = await fetch(`/api/class-chat/${encodeURIComponent(roomId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: message.id, isPinned: !message.isPinned }),
    })
    if (!response.ok) setError('Status sematan pesan gagal diperbarui.')
    else await load(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:min-h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between gap-3 bg-[#064E3B] px-4 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" aria-label="Kembali" className="rounded-xl bg-white/10 p-2"><ArrowLeft size={19} /></Link>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10"><MessageSquare size={20} /></span>
            <div className="min-w-0"><h1 className="truncate font-black">{roomTitle}</h1><p className="text-xs text-emerald-100/65">Grup kelas private</p></div>
          </div>
          <button type="button" onClick={() => void load()} aria-label="Muat ulang" className="rounded-xl p-2 text-emerald-100 hover:bg-white/10"><RefreshCw size={18} /></button>
        </header>

        {pinned.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700"><Pin size={14} /> Pesan disematkan</p>
            <p className="mt-1 line-clamp-2 text-sm text-amber-800">{pinned[pinned.length - 1].content}</p>
          </div>
        )}

        {error && <p className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-6">{error}</p>}

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#eef5f1] p-4 sm:p-6">
          {loading ? <div className="grid h-full place-items-center"><LoaderCircle className="animate-spin text-emerald-700" size={30} /></div> : messages.length === 0 ? <p className="py-20 text-center text-sm text-slate-500">Belum ada pesan. Mulai diskusi kelas di bawah.</p> : messages.map((message) => {
            const mine = message.senderId === currentUserId
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`group max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${mine ? 'rounded-br-md bg-[#1D794E] text-white' : 'rounded-bl-md bg-white text-slate-700'}`}>
                  {!mine && <div className="mb-1 flex items-center gap-2"><p className="text-xs font-black text-emerald-700">{message.senderName}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${message.senderRole === 'asatidz' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{message.senderRole}</span></div>}
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className={`text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString('id-ID')}</span>
                    {canModerate && <button type="button" onClick={() => void togglePin(message)} aria-label={message.isPinned ? 'Lepas sematan' : 'Sematkan pesan'} className={`rounded p-1 ${message.isPinned ? 'text-amber-400' : mine ? 'text-white/50 hover:text-white' : 'text-slate-300 hover:text-amber-500'}`}><Pin size={13} /></button>}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="flex items-end gap-3 border-t border-slate-200 bg-white p-3 sm:p-4">
          <textarea rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Tulis pesan kelas..." className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          <button disabled={sending || !draft.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1D794E] text-white disabled:opacity-50">{sending ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}</button>
        </form>
      </div>
    </div>
  )
}
