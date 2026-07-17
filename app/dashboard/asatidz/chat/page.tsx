'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { LoaderCircle, MessageCircle, Search, Send } from 'lucide-react'

import { ChatService, type ChatConversation, type ChatMessage, type ChatUser } from '../../../../service/chat'

export default function AsatidzChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selected, setSelected] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await ChatService.getInbox()
        if (!cancelled) setConversations(data)
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Gagal memuat chat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? conversations.filter((item) => (item.user.nama ?? '').toLowerCase().includes(query)) : conversations
  }, [conversations, search])

  const openConversation = async (user: ChatUser) => {
    setSelected(user)
    setError('')
    try {
      const data = await ChatService.getChatHistory(user.id)
      setSelected(data.counterpart)
      setMessages(data.messages)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat percakapan')
    }
  }

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !draft.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const message = await ChatService.sendMessage(selected.id, draft)
      setMessages((items) => [...items, message])
      setDraft('')
      setConversations(await ChatService.getInbox())
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
          <h1 className="text-xl font-black text-emerald-950">Pesan</h1>
          <label className="relative mt-4 block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari percakapan..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" />
          </label>
        </div>
        <div className="max-h-[58vh] overflow-y-auto border-t border-slate-100 p-2">
          {loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : visible.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500"><MessageCircle className="mx-auto mb-3 text-slate-300" size={30} />Belum ada percakapan.</div>
          ) : visible.map((item) => (
            <button key={item.user.id} type="button" onClick={() => void openConversation(item.user)} className={`w-full rounded-2xl p-4 text-left transition ${selected?.id === item.user.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
              <p className="font-bold text-slate-900">{item.user.nama || 'Pengguna KajianQu'}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.lastMessage.mine ? 'Anda: ' : ''}{item.lastMessage.content}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[60vh] flex-col">
        {selected ? (
          <>
            <header className="border-b border-slate-200 px-5 py-4">
              <p className="font-black text-slate-900">{selected.nama || 'Pengguna KajianQu'}</p>
              <p className="text-xs capitalize text-slate-500">{selected.role || 'pengguna'}</p>
            </header>
            {error && <p className="mx-5 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.length === 0 ? <p className="py-16 text-center text-sm text-slate-400">Belum ada pesan. Mulai percakapan di bawah.</p> : messages.map((message) => (
                <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.mine ? 'bg-[#1D794E] text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <p>{message.content}</p>
                    <p className={`mt-1 text-[10px] ${message.mine ? 'text-white/60' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tulis pesan..." className="h-12 flex-1 rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
              <button type="submit" disabled={sending || !draft.trim()} className="grid h-12 w-12 place-items-center rounded-xl bg-[#1D794E] text-white disabled:opacity-50">{sending ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}</button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-slate-500"><div><MessageCircle className="mx-auto mb-4 text-slate-300" size={42} /><p className="font-semibold">Pilih percakapan untuk membaca dan membalas pesan.</p>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</div></div>
        )}
      </section>
    </div>
  )
}
