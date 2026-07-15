'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mic,
  RotateCcw,
  Square,
} from 'lucide-react'

import { alignRecitation, type AlignmentResult } from '@/lib/quran-alignment'
import { saveSession } from '@/service/quran-session.service'
import type { QuranChapter, QuranPracticeMode, QuranVerse, WordState } from '@/types/quran'
import { useGeminiLiveRecitation } from '@/components/quran/useGeminiLiveRecitation'

type PracticeStatus = 'ready' | 'connecting' | 'recording' | 'processing' | 'done' | 'error'

interface QuranPracticeClientProps {
  mode: QuranPracticeMode
  chapter: QuranChapter
  verses: QuranVerse[]
  ayahStart: number
  ayahEnd: number
}

const EMPTY_ALIGNMENT: AlignmentResult = {
  states: [],
  mistakes: [],
  currentIndex: 0,
  correctWords: 0,
  processedWords: 0,
  accuracy: 0,
}

function stateClasses(state: WordState): string {
  switch (state) {
    case 'correct':
      return 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200'
    case 'wrong':
      return 'text-red-700 bg-red-50 ring-1 ring-red-200 underline decoration-red-400 decoration-2'
    case 'missed':
      return 'text-amber-700 bg-amber-50 ring-1 ring-amber-200 decoration-amber-500 line-through'
    case 'current':
      return 'text-[#0c5d40] bg-emerald-100 ring-2 ring-[#1a7a53]/40'
    default:
      return 'text-slate-800'
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function QuranPracticeClient({
  mode,
  chapter,
  verses,
  ayahStart,
  ayahEnd,
}: QuranPracticeClientProps) {
  const words = useMemo(() => verses.flatMap((verse) => verse.words), [verses])
  const wordIndexes = useMemo(() => {
    const indexes = new Map<string, number>()
    words.forEach((word, index) => {
      indexes.set(`${word.verseKey}:${word.wordIndex}`, index)
    })
    return indexes
  }, [words])

  const [status, setStatus] = useState<PracticeStatus>('ready')
  const [transcript, setTranscript] = useState('')
  const [alignment, setAlignment] = useState<AlignmentResult>(() => ({
    ...EMPTY_ALIGNMENT,
    states: words.map(() => 'idle'),
  }))
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showMurojaahText, setShowMurojaahText] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startedAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleTranscript = useCallback(
    (nextTranscript: string) => {
      setTranscript(nextTranscript)
      setAlignment(alignRecitation(words, nextTranscript, false))
    },
    [words],
  )

  const handleLiveError = useCallback((message: string) => {
    setErrorMessage(message)
    setStatus('error')
  }, [])

  const {
    isRecording,
    isConnecting,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useGeminiLiveRecitation({
    onTranscript: handleTranscript,
    onError: handleLiveError,
  })

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    resetTranscript()
    setTranscript('')
    setAlignment({ ...EMPTY_ALIGNMENT, states: words.map(() => 'idle') })
    setErrorMessage('')
    setElapsedSeconds(0)
    setShowMurojaahText(false)
    setStatus('ready')
  }, [clearTimer, resetTranscript, words])

  const start = useCallback(async () => {
    reset()
    setStatus('connecting')
    startedAtRef.current = Date.now()
    await startRecording()
    setStatus((current) => (current === 'error' ? current : 'recording'))
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
  }, [reset, startRecording])

  const stop = useCallback(async () => {
    clearTimer()
    setStatus('processing')
    const finalTranscript = await stopRecording()
    const finalAlignment = alignRecitation(words, finalTranscript, true)
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))

    setTranscript(finalTranscript)
    setAlignment(finalAlignment)
    setElapsedSeconds(durationSeconds)
    setStatus('done')
    setShowMurojaahText(true)
    setIsSaving(true)

    await saveSession({
      mode,
      surahId: chapter.id,
      surahName: chapter.nameSimple,
      ayahStart,
      ayahEnd,
      totalWords: words.length,
      correctWords: finalAlignment.correctWords,
      accuracy: finalAlignment.accuracy,
      mistakes: finalAlignment.mistakes,
      durationSeconds,
      transcript: finalTranscript,
    })
    setIsSaving(false)
  }, [ayahEnd, ayahStart, chapter.id, chapter.nameSimple, clearTimer, mode, stopRecording, words])

  const effectiveStatus: PracticeStatus = isConnecting
    ? 'connecting'
    : isRecording
      ? 'recording'
      : status
  const accuracy = Math.round(alignment.accuracy)
  const isMurojaahHidden = mode === 'murojaah' && !showMurojaahText && effectiveStatus !== 'done'

  return (
    <div className="min-h-screen bg-[#f4f8f6] pb-16 pt-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/quran" className="font-semibold text-[#1a7a53] hover:underline">
            ← Kembali pilih ayat
          </Link>
          <span className="rounded-full bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
            {mode === 'ziyadah' ? 'Mode Ziyadah' : 'Mode Murojaah'}
          </span>
        </div>

        <section className="overflow-hidden rounded-3xl bg-[#145c42] text-white shadow-xl shadow-emerald-950/10">
          <div className="grid gap-6 px-6 py-7 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Sahabat Qur&apos;an</p>
              <h1 className="mt-2 text-3xl font-bold">{chapter.nameSimple}</h1>
              <p className="mt-1 text-white/65">{chapter.translatedName}</p>
            </div>
            <div className="text-center font-serif text-4xl md:text-5xl" dir="rtl">
              {chapter.nameArabic}
            </div>
            <div className="md:text-right">
              <p className="font-semibold">Ayat {ayahStart} sampai {ayahEnd}</p>
              <p className="mt-1 text-sm text-white/65">
                {mode === 'ziyadah'
                  ? 'Teks tetap terlihat dan dikoreksi langsung.'
                  : 'Teks disembunyikan selama murojaah, kesalahan tetap ditandai.'}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bacaan Qur&apos;an</h2>
                <p className="mt-1 text-sm text-slate-500">Hijau benar, merah berbeda, kuning terlewat.</p>
              </div>
              {mode === 'murojaah' && (
                <button
                  type="button"
                  onClick={() => setShowMurojaahText((visible) => !visible)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-[#1a7a53]"
                >
                  {showMurojaahText ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showMurojaahText ? 'Sembunyikan teks' : 'Lihat teks'}
                </button>
              )}
            </div>

            <div className="space-y-7" dir="rtl">
              {verses.map((verse) => (
                <div key={verse.id} className="rounded-2xl bg-[#fbfdfc] p-4 ring-1 ring-slate-100 sm:p-5">
                  <div className="text-right font-serif text-[2rem] leading-[2.25] sm:text-[2.2rem]">
                    {verse.words.map((word) => {
                      const globalIndex = wordIndexes.get(`${word.verseKey}:${word.wordIndex}`) ?? -1
                      const state = alignment.states[globalIndex] ?? 'idle'
                      const revealWrong = state === 'wrong' || state === 'missed'
                      const hideWord = isMurojaahHidden && !revealWrong

                      return (
                        <span
                          key={`${verse.verseKey}-${word.wordIndex}`}
                          className={`mx-0.5 inline-block rounded-lg px-1.5 transition-all duration-200 ${
                            hideWord ? 'select-none text-transparent [text-shadow:0_0_11px_rgba(15,23,42,0.35)]' : stateClasses(state)
                          }`}
                        >
                          {word.arabic}
                        </span>
                      )
                    })}
                    <span className="mr-2 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-emerald-200 px-2 align-middle font-sans text-sm font-bold text-[#1a7a53]">
                      {verse.number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Transkrip live Gemini</p>
              <p className="mt-2 min-h-12 text-right text-xl leading-relaxed text-slate-700" dir="rtl">
                {transcript || 'Transkrip bacaan akan muncul di sini saat mikrofon aktif.'}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Durasi</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{formatDuration(elapsedSeconds)}</p>
                </div>
                <div className={`h-3 w-3 rounded-full ${effectiveStatus === 'recording' ? 'animate-pulse bg-red-500' : 'bg-slate-200'}`} />
              </div>

              <div className="mt-5">
                {effectiveStatus === 'ready' || effectiveStatus === 'error' ? (
                  <button
                    type="button"
                    onClick={() => void start()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a7a53] px-4 py-4 font-bold text-white transition hover:bg-[#145f42] active:scale-[0.98]"
                  >
                    <Mic size={20} /> Mulai membaca
                  </button>
                ) : effectiveStatus === 'recording' ? (
                  <button
                    type="button"
                    onClick={() => void stop()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 font-bold text-white transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    <Square size={18} fill="currentColor" /> Selesai
                  </button>
                ) : effectiveStatus === 'done' ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 font-bold text-[#1a7a53] transition hover:bg-emerald-100"
                  >
                    <RotateCcw size={18} /> Ulangi setoran
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-4 font-semibold text-slate-600">
                    <LoaderCircle className="animate-spin" size={18} />
                    {effectiveStatus === 'connecting' ? 'Menghubungkan Gemini Live' : 'Menyelesaikan koreksi'}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-500">Akurasi sementara</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900">{accuracy}%</span>
                <span className="pb-1 text-sm text-slate-500">{alignment.correctWords}/{words.length} kata benar</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#1a7a53] transition-all duration-300" style={{ width: `${Math.min(100, accuracy)}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-xl bg-red-50 p-3">
                  <p className="font-black text-red-700">{alignment.mistakes.filter((item) => item.kind === 'substitution').length}</p>
                  <p className="text-red-600">Berbeda</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="font-black text-amber-700">{alignment.mistakes.filter((item) => item.kind === 'omission').length}</p>
                  <p className="text-amber-600">Terlewat</p>
                </div>
              </div>
            </section>

            {effectiveStatus === 'done' && (
              <section className="rounded-3xl bg-emerald-950 p-5 text-white shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={21} />
                  <div>
                    <p className="font-bold">Sesi selesai</p>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-100/75">
                      {isSaving ? 'Menyimpan hasil ke riwayat...' : 'Hasil sudah disimpan ke riwayat latihan.'}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <p className="px-2 text-xs leading-relaxed text-slate-400">
              Koreksi live menunjukkan kecocokan urutan dan kata berdasarkan transkripsi audio AI. Hasilnya membantu latihan dan bukan pengganti talaqqi atau penilaian tajwid dari guru.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
