'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpenCheck, Brain, Headphones, Search, Sparkles } from 'lucide-react'

import type { QuranChapter, QuranPracticeMode } from '@/types/quran'

interface Props {
  chapters: QuranChapter[]
  initialMode?: QuranPracticeMode
}

const MODE_COPY: Record<QuranPracticeMode, { title: string; description: string }> = {
  murojaah: {
    title: 'Murojaah',
    description: 'Baca dari hafalan. Koreksi lafaz dan urutan kata baru ditampilkan setelah bacaan selesai.',
  },
  belajar: {
    title: "Belajar Al-Qur'an",
    description: 'Dengarkan contoh bacaan ayat pilihan, baca ulang, lalu terima analisis audio tajwid dan bacaan setelah selesai.',
  },
}

export default function QuranAiHubClient({ chapters, initialMode = 'murojaah' }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<QuranPracticeMode>(initialMode)
  const [search, setSearch] = useState('')
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? 1)
  const selectedChapter = chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0]
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(Math.min(7, selectedChapter?.versesCount ?? 7))

  const filteredChapters = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return chapters
    return chapters.filter((chapter) =>
      `${chapter.id} ${chapter.nameSimple} ${chapter.nameArabic} ${chapter.translatedName}`
        .toLowerCase()
        .includes(keyword),
    )
  }, [chapters, search])

  const selectChapter = (id: number) => {
    const chapter = chapters.find((item) => item.id === id)
    if (!chapter) return
    setChapterId(id)
    setAyahStart(1)
    setAyahEnd(Math.min(7, chapter.versesCount))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!selectedChapter) return
    const start = Math.max(1, Math.min(ayahStart, selectedChapter.versesCount))
    const end = Math.max(start, Math.min(ayahEnd, selectedChapter.versesCount))
    router.push(`/quran-ai/${mode}/${selectedChapter.id}?start=${start}&end=${end}`)
  }

  if (!selectedChapter) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-slate-500">Daftar surah tidak tersedia.</div>
  }

  return (
    <div className="min-h-screen bg-[#f4f8f6] pb-20 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="overflow-hidden rounded-[36px] bg-[#0f5b40] p-7 text-white shadow-2xl shadow-emerald-950/15 sm:p-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-200">Quran AI</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Latihan bacaan sesuai tujuan belajarmu</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Pilih Murojaah untuk setor hafalan dan lihat koreksi setelah selesai, atau Belajar Al-Qur&apos;an untuk dengar lalu baca ulang dengan analisis audio pendamping.
              </p>
            </div>
            <Link href="/quran-ai/quiz" className="group rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:bg-white/15">
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0f5b40]"><Sparkles size={22} /></span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Generate Quiz</span>
              </div>
              <h2 className="mt-5 text-xl font-black">Quiz Ayat Al-Qur&apos;an</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">Pilih rentang ayat lalu generate soal baru dari teks Qur&apos;an canonical.</p>
            </Link>
          </div>
        </section>

        <form onSubmit={submit} className="mt-7 grid gap-7 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Pilih Mode</p>
              <div className="mt-4 space-y-3">
                {(['murojaah', 'belajar'] as QuranPracticeMode[]).map((item) => {
                  const Icon = item === 'murojaah' ? Brain : Headphones
                  const active = mode === item
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${active ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-[#0f5b40] text-white' : 'bg-slate-100 text-slate-500'}`}><Icon size={19} /></span>
                        <div><p className="font-black text-slate-900">{MODE_COPY[item].title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{MODE_COPY[item].description}</p></div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b40] px-5 py-4 font-black text-white shadow-lg transition hover:bg-[#0b4933]">
              <BookOpenCheck size={19} /> Mulai {MODE_COPY[mode].title}
            </button>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Pilih Bacaan</p><h2 className="mt-2 text-2xl font-black text-slate-900">Surah dan rentang ayat</h2></div>
              <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari surah..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-emerald-500" /></div>
            </div>

            <div className="mt-5 max-h-[390px] space-y-2 overflow-y-auto pr-1">
              {filteredChapters.map((chapter) => (
                <button key={chapter.id} type="button" onClick={() => selectChapter(chapter.id)} className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${chapter.id === chapterId ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">{chapter.id}</span><div><p className="font-black text-slate-900">{chapter.nameSimple}</p><p className="mt-1 text-xs text-slate-500">{chapter.translatedName} · {chapter.versesCount} ayat</p></div></div>
                  <span className="font-serif text-2xl text-emerald-800" dir="rtl">{chapter.nameArabic}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
              <label className="space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Dari ayat</span><input type="number" min={1} max={selectedChapter.versesCount} value={ayahStart} onChange={(event) => { const next = Number(event.target.value); setAyahStart(next); if (next > ayahEnd) setAyahEnd(next) }} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-emerald-500" /></label>
              <label className="space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Sampai ayat</span><input type="number" min={Math.max(1, ayahStart)} max={selectedChapter.versesCount} value={ayahEnd} onChange={(event) => setAyahEnd(Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-emerald-500" /></label>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}
