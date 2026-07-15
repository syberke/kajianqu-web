'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpenCheck, Brain, Search, Sparkles } from 'lucide-react'

import type { QuranChapter, QuranPracticeMode } from '@/types/quran'

interface QuranClientProps {
  chapters: QuranChapter[]
}

export default function QuranClient({ chapters }: QuranClientProps) {
  const router = useRouter()
  const [mode, setMode] = useState<QuranPracticeMode>('ziyadah')
  const [chapterId, setChapterId] = useState(1)
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(7)
  const [search, setSearch] = useState('')

  const selectedChapter = chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0]
  const filteredChapters = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return chapters
    return chapters.filter((chapter) =>
      `${chapter.id} ${chapter.nameSimple} ${chapter.translatedName}`.toLowerCase().includes(query),
    )
  }, [chapters, search])

  const selectChapter = (id: number) => {
    const chapter = chapters.find((item) => item.id === id)
    if (!chapter) return
    setChapterId(id)
    setAyahStart(1)
    setAyahEnd(chapter.versesCount)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedChapter) return
    const start = Math.max(1, Math.min(ayahStart, selectedChapter.versesCount))
    const end = Math.max(start, Math.min(ayahEnd, selectedChapter.versesCount))
    router.push(`/quran/${mode}/${selectedChapter.id}?start=${start}&end=${end}`)
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] pb-20">
      <section className="relative overflow-hidden bg-[#145c42] px-4 pb-20 pt-32 text-white sm:px-6">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Sahabat Qur&apos;an AI</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Latihan hafalan dengan koreksi bacaan secara live
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Pilih Ziyadah atau Murojaah, tentukan surah dan rentang ayat, lalu baca. Kata yang berbeda atau terlewat akan ditandai selama kamu membaca.
          </p>
        </div>
      </section>

      <main className="relative mx-auto -mt-10 w-full max-w-5xl px-4 sm:px-6">
        <section className="rounded-3xl bg-white p-5 shadow-xl shadow-emerald-950/10 ring-1 ring-slate-200 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('ziyadah')}
              className={`rounded-2xl border p-5 text-left transition ${
                mode === 'ziyadah'
                  ? 'border-[#1a7a53] bg-emerald-50 ring-2 ring-[#1a7a53]/15'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1a7a53] text-white"><Sparkles size={21} /></span>
                <div>
                  <h2 className="font-bold text-slate-900">Ziyadah</h2>
                  <p className="text-sm text-slate-500">Tambah hafalan baru</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">Teks ayat tetap terlihat. Cocok untuk mengulang ayat baru sambil melihat koreksi kata secara langsung.</p>
            </button>

            <button
              type="button"
              onClick={() => setMode('murojaah')}
              className={`rounded-2xl border p-5 text-left transition ${
                mode === 'murojaah'
                  ? 'border-[#1a7a53] bg-emerald-50 ring-2 ring-[#1a7a53]/15'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white"><Brain size={21} /></span>
                <div>
                  <h2 className="font-bold text-slate-900">Murojaah</h2>
                  <p className="text-sm text-slate-500">Uji hafalan lama</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">Teks disamarkan selama membaca. Kata yang salah atau terlewat dapat muncul sebagai koreksi tanpa membuka seluruh ayat.</p>
            </button>
          </div>

          <form onSubmit={submit} className="mt-8 grid gap-5 border-t border-slate-100 pt-7 md:grid-cols-[1fr_160px_160px_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Surah</span>
              <select
                value={chapterId}
                onChange={(event) => selectChapter(Number(event.target.value))}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#1a7a53] focus:ring-2 focus:ring-emerald-100"
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{chapter.id}. {chapter.nameSimple} · {chapter.versesCount} ayat</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Ayat awal</span>
              <input
                type="number"
                min={1}
                max={selectedChapter?.versesCount ?? 1}
                value={ayahStart}
                onChange={(event) => setAyahStart(Number(event.target.value))}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#1a7a53] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Ayat akhir</span>
              <input
                type="number"
                min={ayahStart}
                max={selectedChapter?.versesCount ?? 1}
                value={ayahEnd}
                onChange={(event) => setAyahEnd(Number(event.target.value))}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-[#1a7a53] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <button type="submit" className="h-12 rounded-xl bg-[#1a7a53] px-6 font-bold text-white transition hover:bg-[#145f42]">
              Mulai latihan
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">114 Surah</h2>
              <p className="mt-1 text-sm text-slate-500">Data surah dimuat dari Quran API.</p>
            </div>
            <label className="relative block w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari surah..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#1a7a53]"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((chapter) => (
              <button
                type="button"
                key={chapter.id}
                onClick={() => selectChapter(chapter.id)}
                className={`flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                  chapterId === chapter.id ? 'ring-[#1a7a53]' : 'ring-slate-200'
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 font-black text-[#1a7a53]">{chapter.id}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-slate-900">{chapter.nameSimple}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{chapter.versesCount} ayat · {chapter.revelationPlace}</span>
                </span>
                <BookOpenCheck size={18} className="text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
