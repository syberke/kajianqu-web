'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  LoaderCircle,
  Mic,
  Pause,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react'

import { useGeminiLiveRecitation, type RecitationRecordingResult } from '@/components/quran/useGeminiLiveRecitation'
import { alignRecitation, type AlignmentResult } from '@/lib/quran-alignment'
import { saveSession } from '@/service/quran-session.service'
import type {
  QuranChapter,
  QuranPracticeMode,
  QuranRecitationAnalysis,
  QuranVerse,
  RecitationCategoryFeedback,
  WordState,
} from '@/types/quran'

type PracticeStatus = 'ready' | 'connecting' | 'recording' | 'processing' | 'done' | 'error'
type LearningStep = 'listen' | 'read' | 'done'

interface Props {
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

const ANALYSIS_LABELS: Array<[
  keyof Pick<QuranRecitationAnalysis, 'makhraj' | 'tajwid' | 'mad' | 'ghunnah' | 'qalqalah' | 'waqafIbtida'>,
  string,
]> = [
  ['makhraj', 'Makhraj Huruf'],
  ['tajwid', 'Tajwid & Hukum Bacaan'],
  ['mad', 'Mad'],
  ['ghunnah', 'Ghunnah'],
  ['qalqalah', 'Qalqalah'],
  ['waqafIbtida', 'Waqaf & Ibtida'],
]

function wordClasses(state: WordState): string {
  if (state === 'correct') return 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200'
  if (state === 'wrong') return 'text-red-700 bg-red-50 ring-1 ring-red-200 underline decoration-red-400 decoration-2'
  if (state === 'missed') return 'text-amber-700 bg-amber-50 ring-1 ring-amber-200 line-through decoration-amber-500'
  return 'text-slate-800'
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function CategoryCard({ title, feedback }: { title: string; feedback: RecitationCategoryFeedback }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-black text-slate-900">{title}</h4>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {Math.round(feedback.score)}/100
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{feedback.feedback}</p>
    </article>
  )
}

export default function QuranPracticeClient({ mode, chapter, verses, ayahStart, ayahEnd }: Props) {
  const words = useMemo(() => verses.flatMap((verse) => verse.words), [verses])
  const expectedText = useMemo(() => verses.map((verse) => verse.textUthmani).join('\n'), [verses])
  const referenceAudioUrls = useMemo(
    () => words.map((word) => word.audioUrl).filter((url): url is string => Boolean(url)),
    [words],
  )
  const wordIndexes = useMemo(() => {
    const indexes = new Map<string, number>()
    words.forEach((word, index) => indexes.set(`${word.verseKey}:${word.wordIndex}`, index))
    return indexes
  }, [words])

  const [status, setStatus] = useState<PracticeStatus>('ready')
  const [learningStep, setLearningStep] = useState<LearningStep>(mode === 'belajar' ? 'listen' : 'read')
  const [hasListened, setHasListened] = useState(mode !== 'belajar')
  const [isPlayingReference, setIsPlayingReference] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [alignment, setAlignment] = useState<AlignmentResult>({ ...EMPTY_ALIGNMENT, states: words.map(() => 'idle') })
  const [analysis, setAnalysis] = useState<QuranRecitationAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [lastRecording, setLastRecording] = useState<RecitationRecordingResult | null>(null)

  const startedAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playbackRunRef = useRef(0)
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null)

  const handleTranscript = useCallback((nextTranscript: string) => setTranscript(nextTranscript), [])
  const handleLiveError = useCallback((message: string) => {
    setErrorMessage(message)
    setStatus('error')
  }, [])

  const { isRecording, isConnecting, startRecording, stopRecording, resetTranscript } = useGeminiLiveRecitation({
    onTranscript: handleTranscript,
    onError: handleLiveError,
  })

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const stopReference = useCallback(() => {
    playbackRunRef.current += 1
    referenceAudioRef.current?.pause()
    referenceAudioRef.current = null
    setIsPlayingReference(false)
  }, [])

  const playReference = useCallback(async () => {
    if (referenceAudioUrls.length === 0) {
      setErrorMessage('Audio contoh untuk rentang ayat ini tidak tersedia dari Quran API.')
      return
    }

    stopReference()
    const runId = playbackRunRef.current
    setErrorMessage('')
    setIsPlayingReference(true)

    try {
      for (const url of referenceAudioUrls) {
        if (playbackRunRef.current !== runId) return

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(url)
          referenceAudioRef.current = audio

          const finish = () => {
            audio.onended = null
            audio.onerror = null
            audio.onpause = null
            resolve()
          }

          audio.onended = finish
          audio.onpause = () => {
            if (playbackRunRef.current !== runId) finish()
          }
          audio.onerror = () => reject(new Error('Audio contoh gagal diputar'))
          void audio.play().catch(reject)
        })
      }

      if (playbackRunRef.current === runId) {
        setHasListened(true)
        setLearningStep('read')
      }
    } catch (error) {
      if (playbackRunRef.current === runId) {
        setErrorMessage(error instanceof Error ? error.message : 'Audio contoh gagal diputar')
      }
    } finally {
      if (playbackRunRef.current === runId) {
        referenceAudioRef.current = null
        setIsPlayingReference(false)
      }
    }
  }, [referenceAudioUrls, stopReference])

  const resetRecitation = useCallback(() => {
    clearTimer()
    resetTranscript()
    setTranscript('')
    setAlignment({ ...EMPTY_ALIGNMENT, states: words.map(() => 'idle') })
    setAnalysis(null)
    setAnalysisError('')
    setErrorMessage('')
    setElapsedSeconds(0)
    setLastRecording(null)
    setStatus('ready')
  }, [clearTimer, resetTranscript, words])

  const resetAll = useCallback(() => {
    stopReference()
    resetRecitation()
    const mustListen = mode === 'belajar'
    setHasListened(!mustListen)
    setLearningStep(mustListen ? 'listen' : 'read')
  }, [mode, resetRecitation, stopReference])

  const start = useCallback(async () => {
    if (mode === 'belajar' && !hasListened) {
      setErrorMessage('Dengarkan contoh bacaan sampai selesai sebelum mulai membaca.')
      return
    }

    resetRecitation()
    setLearningStep('read')
    setStatus('connecting')
    startedAtRef.current = Date.now()
    const started = await startRecording()
    if (!started) return

    setStatus('recording')
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1_000)
  }, [hasListened, mode, resetRecitation, startRecording])

  const requestAnalysis = useCallback(async (recording: RecitationRecordingResult) => {
    if (!recording.audioBlob) {
      setAnalysisError('Browser tidak menghasilkan rekaman audio utuh untuk analisis tajwid.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError('')
    try {
      const extension = recording.mimeType.includes('ogg') ? 'ogg' : 'webm'
      const formData = new FormData()
      formData.append('audio', recording.audioBlob, `quran-recitation.${extension}`)
      formData.append('expectedText', expectedText)
      formData.append('transcript', recording.transcript)
      formData.append('surahName', chapter.nameSimple)
      formData.append('ayahStart', String(ayahStart))
      formData.append('ayahEnd', String(ayahEnd))

      const response = await fetch('/api/quran/recitation-analysis', { method: 'POST', body: formData })
      const payload = (await response.json().catch(() => null)) as {
        analysis?: QuranRecitationAnalysis
        error?: string
      } | null
      if (!response.ok || !payload?.analysis) throw new Error(payload?.error ?? 'Analisis audio gagal')
      setAnalysis(payload.analysis)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analisis audio gagal')
    } finally {
      setIsAnalyzing(false)
    }
  }, [ayahEnd, ayahStart, chapter.nameSimple, expectedText])

  const stop = useCallback(async () => {
    clearTimer()
    setStatus('processing')
    const recording = await stopRecording()
    const finalAlignment = alignRecitation(words, recording.transcript, true)
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1_000))

    setLastRecording(recording)
    setTranscript(recording.transcript)
    setAlignment(finalAlignment)
    setElapsedSeconds(durationSeconds)
    setIsSaving(true)

    const tasks: Promise<unknown>[] = [
      saveSession({
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
        transcript: recording.transcript,
      }),
    ]
    if (mode === 'belajar') tasks.push(requestAnalysis(recording))
    await Promise.allSettled(tasks)

    setIsSaving(false)
    setLearningStep('done')
    setStatus('done')
  }, [ayahEnd, ayahStart, chapter.id, chapter.nameSimple, clearTimer, mode, requestAnalysis, stopRecording, words])

  const effectiveStatus: PracticeStatus = isConnecting ? 'connecting' : isRecording ? 'recording' : status
  const isDone = effectiveStatus === 'done'
  const accuracy = Math.round(alignment.accuracy)
  const hideMurojaahText = mode === 'murojaah' && !isDone

  return (
    <div className="min-h-screen bg-[#f4f8f6] pb-16 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/quran-ai" className="font-semibold text-[#1a7a53] hover:underline">← Kembali ke Quran AI</Link>
          <span className="rounded-full bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
            {mode === 'murojaah' ? 'Mode Murojaah' : "Mode Belajar Al-Qur'an"}
          </span>
        </div>

        <section className="overflow-hidden rounded-3xl bg-[#145c42] text-white shadow-xl shadow-emerald-950/10">
          <div className="grid gap-6 px-6 py-7 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Quran AI</p>
              <h1 className="mt-2 text-3xl font-bold">{chapter.nameSimple}</h1>
              <p className="mt-1 text-white/65">{chapter.translatedName}</p>
            </div>
            <div className="text-center font-serif text-4xl md:text-5xl" dir="rtl">{chapter.nameArabic}</div>
            <div className="md:text-right">
              <p className="font-semibold">Ayat {ayahStart} sampai {ayahEnd}</p>
              <p className="mt-1 text-sm text-white/65">
                {mode === 'murojaah'
                  ? 'Baca dari hafalan. Koreksi baru dibuka setelah selesai.'
                  : 'Dengarkan bacaan, baca ulang, lalu lihat analisis audio bacaan.'}
              </p>
            </div>
          </div>
        </section>

        {mode === 'belajar' && learningStep === 'listen' && (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#145c42] text-white"><Headphones size={23} /></span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Langkah 1 · Dengarkan</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">Simak bacaan ayat sampai selesai</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Tombol membaca baru aktif setelah audio contoh untuk seluruh rentang ayat selesai diputar.</p>
                </div>
              </div>
              <button type="button" onClick={() => isPlayingReference ? stopReference() : void playReference()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#145c42] px-5 py-4 font-black text-white">
                {isPlayingReference ? <><Pause size={19} /> Hentikan</> : <><Volume2 size={19} /> Dengarkan Bacaan</>}
              </button>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold text-slate-900">{hideMurojaahText ? 'Area Murojaah' : "Bacaan Al-Qur'an"}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isDone
                  ? 'Hijau benar, merah berbeda, kuning terlewat.'
                  : mode === 'murojaah'
                    ? 'Teks dan hasil koreksi disembunyikan sampai sesi selesai.'
                    : 'Ikuti teks setelah selesai mendengarkan contoh bacaan.'}
              </p>
            </div>

            {hideMurojaahText ? (
              <div className="grid min-h-[430px] place-items-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center">
                <div>
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#145c42] text-4xl text-white">🧠</div>
                  <h3 className="mt-5 text-2xl font-black text-slate-900">Baca dari hafalanmu</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">Quran AI tetap menyimak audio, tetapi transkrip, teks ayat, dan koreksi tidak ditampilkan selama Murojaah.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-7" dir="rtl">
                {verses.map((verse) => (
                  <div key={verse.id} className="rounded-2xl bg-[#fbfdfc] p-4 ring-1 ring-slate-100 sm:p-5">
                    <div className="text-right font-serif text-[2rem] leading-[2.25] sm:text-[2.2rem]">
                      {verse.words.map((word) => {
                        const globalIndex = wordIndexes.get(`${word.verseKey}:${word.wordIndex}`) ?? -1
                        const wordState = isDone ? alignment.states[globalIndex] ?? 'idle' : 'idle'
                        return <span key={`${verse.verseKey}-${word.wordIndex}`} className={`mx-0.5 inline-block rounded-lg px-1.5 transition ${wordClasses(wordState)}`}>{word.arabic}</span>
                      })}
                      <span className="mr-2 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-emerald-200 px-2 align-middle font-sans text-sm font-bold text-[#1a7a53]">{verse.number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isDone && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Transkrip hasil simakan</p>
                <p className="mt-2 min-h-12 text-right text-xl leading-relaxed text-slate-700" dir="rtl">{transcript || 'Tidak ada transkrip yang terbaca.'}</p>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-semibold text-slate-500">Durasi bacaan</p><p className="mt-1 text-2xl font-black text-slate-900">{formatDuration(elapsedSeconds)}</p></div>
                <div className={`h-3 w-3 rounded-full ${effectiveStatus === 'recording' ? 'animate-pulse bg-red-500' : 'bg-slate-200'}`} />
              </div>

              <div className="mt-5">
                {mode === 'belajar' && !hasListened ? (
                  <button type="button" onClick={() => void playReference()} disabled={isPlayingReference} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#145c42] px-4 py-4 font-bold text-white disabled:opacity-60"><Headphones size={20} /> {isPlayingReference ? 'Sedang mendengarkan...' : 'Dengarkan dulu'}</button>
                ) : effectiveStatus === 'ready' || effectiveStatus === 'error' ? (
                  <button type="button" onClick={() => void start()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a7a53] px-4 py-4 font-bold text-white transition hover:bg-[#145f42]"><Mic size={20} /> Mulai membaca</button>
                ) : effectiveStatus === 'recording' ? (
                  <button type="button" onClick={() => void stop()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-4 font-bold text-white transition hover:bg-red-700"><Square size={18} fill="currentColor" /> Selesai membaca</button>
                ) : effectiveStatus === 'done' ? (
                  <button type="button" onClick={resetAll} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 font-bold text-[#1a7a53]"><RotateCcw size={18} /> Ulangi latihan</button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-4 font-semibold text-slate-600"><LoaderCircle className="animate-spin" size={18} />{effectiveStatus === 'connecting' ? 'Menghubungkan Gemini Live' : mode === 'belajar' ? 'Menganalisis bacaan' : 'Menyelesaikan koreksi'}</div>
                )}
              </div>

              {mode === 'belajar' && hasListened && effectiveStatus === 'ready' && (
                <button type="button" onClick={() => void playReference()} disabled={isPlayingReference} className="mt-3 w-full text-sm font-bold text-emerald-700 hover:underline">{isPlayingReference ? 'Memutar ulang...' : 'Dengarkan contoh lagi'}</button>
              )}
              {errorMessage && <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{errorMessage}</span></div>}
            </section>

            {isDone && (
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-500">Kecocokan lafaz & urutan</p>
                <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-black text-slate-900">{accuracy}%</span><span className="pb-1 text-sm text-slate-500">{alignment.correctWords}/{words.length} kata benar</span></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1a7a53]" style={{ width: `${Math.min(100, accuracy)}%` }} /></div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm"><div className="rounded-xl bg-red-50 p-3"><p className="font-black text-red-700">{alignment.mistakes.filter((item) => item.kind === 'substitution').length}</p><p className="text-red-600">Berbeda</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="font-black text-amber-700">{alignment.mistakes.filter((item) => item.kind === 'omission').length}</p><p className="text-amber-600">Terlewat</p></div></div>
              </section>
            )}

            {isDone && (
              <section className="rounded-3xl bg-emerald-950 p-5 text-white shadow-sm">
                <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={21} /><div><p className="font-bold">Sesi selesai</p><p className="mt-1 text-sm leading-relaxed text-emerald-100/75">{isSaving ? 'Menyimpan hasil ke riwayat...' : 'Hasil lafaz dan urutan sudah diproses.'}</p></div></div>
              </section>
            )}
          </aside>
        </div>

        {mode === 'belajar' && (isDone || isAnalyzing) && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Analisis Audio AI</p><h2 className="mt-2 text-2xl font-black text-slate-900">Makhraj, tajwid, dan hukum bacaan</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">Analisis ini membaca sinyal audio dan memberi indikasi latihan. Hasilnya bukan penilaian talaqqi final dan tetap perlu diverifikasi bersama guru atau ustadz.</p></div>
              {analysis && <span className="rounded-2xl bg-[#145c42] px-5 py-3 text-xl font-black text-white">{Math.round(analysis.overallScore)}/100</span>}
            </div>

            {isAnalyzing ? (
              <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-slate-50 py-12 font-bold text-slate-600"><LoaderCircle className="animate-spin" /> Gemini sedang menganalisis rekaman penuh...</div>
            ) : analysis ? (
              <>
                <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900">{analysis.summary}</div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{ANALYSIS_LABELS.map(([key, title]) => <CategoryCard key={key} title={title} feedback={analysis[key]} />)}</div>
                <div className="mt-7">
                  <h3 className="text-lg font-black text-slate-900">Temuan yang perlu dilatih</h3>
                  {analysis.issues.length === 0 ? (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Tidak ada temuan audio spesifik yang cukup jelas untuk ditandai.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {analysis.issues.map((issue, index) => (
                        <article key={`${issue.category}-${index}`} className="rounded-2xl border border-slate-200 p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{issue.category.replace('_', ' ')}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${issue.severity === 'utama' ? 'bg-red-50 text-red-700' : issue.severity === 'sedang' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{issue.severity}</span>
                            {issue.ayahNumber && <span className="text-xs text-slate-400">Ayat {issue.ayahNumber}</span>}
                          </div>
                          {issue.word && <p className="mt-3 text-right font-serif text-2xl text-slate-900" dir="rtl">{issue.word}</p>}
                          <p className="mt-3 text-sm leading-relaxed text-slate-700"><strong>Terdengar:</strong> {issue.observation}</p>
                          <p className="mt-2 text-sm leading-relaxed text-emerald-800"><strong>Latihan:</strong> {issue.suggestion}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
                <p>{analysisError || 'Analisis audio belum tersedia.'}</p>
                {lastRecording?.audioBlob && (
                  <button type="button" onClick={() => void requestAnalysis(lastRecording)} className="mt-3 font-black underline">Coba analisis ulang</button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
