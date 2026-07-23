'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, MessageCircle, RefreshCw, Search, Send } from 'lucide-react'

import { ChatService, type ChatConversation, type ChatMessage, type ChatUser } from '@/service/chat'

interface Props {
  initialUserId?: string
  heading?: string
}

export default function ChatWorkspace({ initialUserId, heading = 'Pesan' }: Props) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selected, setSelected] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<ChatUser | null>(null)

  useEffect(() => { selectedRef.current = selected }, [selected])

  const loadInbox = useCallback(async () => {
    const data = await ChatService.getInbox()
    setConversations(data)
    return data
  }, [])

  const openConversation = useCallback(async (user: ChatUser, quiet = false) => {
    if (!quiet) setConversationLoading(true)
    setError('')
    try {
      const data = await ChatService.getChatHistory(user.id)
      setSelected(data.counterpart)
      setMessages(data.messages)
      if (!quiet) await loadInbox()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat percakapan')
    } finally {
      if (!quiet) setConversationLoading(false)
    }
  }, [loadInbox])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        await loadInbox()
        if (!cancelled && initialUserId) {
          await openConversation({ id: initialUserId, nama: '', fotoUrl: null, role: null })
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Gagal memuat chat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [initialUserId, loadInbox, openConversation])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadInbox().catch(() => undefined)
      const active = selectedRef.current
      if (active) void openConversation(active, true)
    }, 8_000)
    return () => window.clearInterval(timer)
  }, [loadInbox, openConversation])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? conversations.filter((item) => (item.user.nama ?? '').toLowerCase().includes(query)) : conversations
  }, [conversations, search])

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !draft.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const message = await ChatService.sendMessage(selected.id, draft)
      setMessages((items) => [...items, message])
      setDraft('')
      await loadInbox()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid min-h-[70vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
        <div className="p-5">
          <div className="flex items-center justify-between"><h1 className="text-xl font-black text-emerald-950">{heading}</h1><button type="button" aria-label="Muat ulang chat" onClick={() => void loadInbox()} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"><RefreshCw size={17} /></button></div>
          <label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari percakapan..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" /></label>
        </div>
        <div className="max-h-[58vh] overflow-y-auto border-t border-slate-100 p-2">
          {loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : visible.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500"><MessageCircle className="mx-auto mb-3 text-slate-300" size={30} />Belum ada percakapan.<p className="mt-2 text-xs text-slate-400">Siswa dapat memulai chat dari halaman daftar ustadz.</p></div> : visible.map((item) => <button key={item.user.id} type="button" onClick={() => void openConversation(item.user)} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${selected?.id === item.user.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-emerald-100 text-sm font-black text-emerald-800">{item.user.fotoUrl ? <img src={item.user.fotoUrl} alt="" className="h-full w-full object-cover" /> : item.user.nama?.slice(0, 1) || 'K'}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-bold text-slate-900">{item.user.nama || 'Pengguna KajianQu'}</p>{item.unreadCount > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-emerald-700 px-1.5 py-0.5 text-[10px] font-black text-white">{item.unreadCount}</span>}</div><p className={`mt-1 line-clamp-1 text-xs ${item.unreadCount ? 'font-bold text-slate-700' : 'text-slate-500'}`}>{item.lastMessage.mine ? 'Anda: ' : ''}{item.lastMessage.content}</p></div></button>)}
        </div>
      </aside>

      <section className="flex min-h-[60vh] flex-col">
        {selected ? <><header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-emerald-100 font-black text-emerald-800">{selected.fotoUrl ? <img src={selected.fotoUrl} alt="" className="h-full w-full object-cover" /> : selected.nama?.slice(0, 1) || 'K'}</div><div><p className="font-black text-slate-900">{selected.nama || 'Pengguna KajianQu'}</p><p className="text-xs capitalize text-slate-500">{selected.role || 'pengguna'}</p></div></header>{error && <p className="mx-5 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="relative flex-1 space-y-3 overflow-y-auto p-5">{conversationLoading ? <div className="absolute inset-0 z-10 grid place-items-center bg-white/70"><LoaderCircle className="animate-spin text-emerald-700" /></div> : messages.length === 0 ? <p className="py-16 text-center text-sm text-slate-400">Belum ada pesan. Mulai percakapan di bawah.</p> : messages.map((message) => <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${message.mine ? 'rounded-br-md bg-[#1D794E] text-white' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}><p className="whitespace-pre-wrap break-words">{message.content}</p><p className={`mt-1 text-[10px] ${message.mine ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString('id-ID')}</p></div></div>)}<div ref={bottomRef} /></div><form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4"><label className="sr-only" htmlFor="chat-message">Tulis pesan</label><textarea id="chat-message" rows={1} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Tulis pesan..." className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /><button type="submit" aria-label="Kirim pesan" disabled={sending || !draft.trim()} className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D794E] text-white disabled:opacity-50">{sending ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}</button></form></> : <div className="grid flex-1 place-items-center p-8 text-center text-slate-500"><div><MessageCircle className="mx-auto mb-4 text-slate-300" size={42} /><p className="font-semibold">Pilih percakapan untuk membaca dan membalas pesan.</p>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</div></div>}
      </section>
    </div>
  )
}
