// app/dashboard/siswa/quran-ai/tahsin/page.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Mic, MicOff, RotateCcw, Volume2, AlertCircle } from 'lucide-react'
import TajwidFeedbackCard from '@/components/quran/TajwidFeedbackCard'
import { useTajwidFeedback } from '@/components/quran/useTajwidFeedback'
import { useQuranRecorder } from '@/components/quran/useQuranRecorder'
import { buildWordList, getSurah, getAudioUrl, compareWord } from '@/lib/quran-data'
import { saveSession } from '@/service/quran-session.service'
import { WordState, SessionMistake } from '@/types/quran'

type Step = 'listen' | 'read' | 'done'

export default function TahsinPage() {
  const [surahId, setSurahId] = useState(1)
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(7)
  const [step, setStep] = useState<Step>('listen')
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const [words, setWords] = useState(() => buildWordList(1, 1, 7))
  const [wordStates, setWordStates] = useState<WordState[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mistakes, setMistakes] = useState<SessionMistake[]>([])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  // ── FIX 1: deklarasikan surah di atas sebelum dipakai ──
  const surah = getSurah(surahId)

  const { feedback, isLoading: feedbackLoading, analyze, retry, reset: resetFeedback } = useTajwidFeedback()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef(0)
  const currentIndexRef = useRef(0)
  const wordStatesRef = useRef<WordState[]>([])
  const mistakesRef = useRef<SessionMistake[]>([])
  const wordsRef = useRef(words)

  useEffect(() => { wordsRef.current = words }, [words])

  // ── FIX 2: handleTranscript harus terima (text, isFinal) — 2 argumen ──
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setLiveTranscript(text)
    const spokenWords = text.trim().split(/\s+/).filter(Boolean)

    let localIndex = 0
    const newStates = [...wordStatesRef.current]
    const newMistakes = [...mistakesRef.current]

    spokenWords.forEach((spoken) => {
      const idx = localIndex
      if (idx >= wordsRef.current.length) return

      const isCorrect = compareWord(wordsRef.current[idx].arabic, spoken)
      if (newStates[idx] !== 'correct') {
        newStates[idx] = isCorrect ? 'correct' : 'wrong'
      }
      if (!isCorrect && !newMistakes.find(m => m.wordIndex === wordsRef.current[idx].wordIndex)) {
        newMistakes.push({
          wordArabic: wordsRef.current[idx].arabic,
          wordSpoken: spoken,
          ayahNumber: wordsRef.current[idx].ayahNumber,
          wordIndex: wordsRef.current[idx].wordIndex,
        })
      }
      localIndex++
    })

    wordStatesRef.current = newStates
    mistakesRef.current = newMistakes
    currentIndexRef.current = localIndex
    setWordStates([...newStates])
    setCurrentIndex(localIndex)

    if (isFinal) {
      setMistakes([...newMistakes])
      const correct = newStates.filter(s => s === 'correct').length
      const acc = wordsRef.current.length > 0
        ? Math.round((correct / wordsRef.current.length) * 100)
        : 0
      setAccuracy(acc)
      setStep('done')

      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      const currentSurah = getSurah(surahId)
      setIsSaving(true)
      saveSession({
        mode: 'tahsin',
        surahId,
        surahName: currentSurah?.name ?? '',
        ayahStart,
        ayahEnd,
        totalWords: wordsRef.current.length,
        correctWords: correct,
        accuracy: acc,
        mistakes: newMistakes,
        durationSeconds: duration,
      }).finally(() => setIsSaving(false))
    }
  }, [surahId, ayahStart, ayahEnd])

  const handleError = useCallback((msg: string) => {
    setErrorMessage(msg)
  }, [])

  // ── FIX 3: onFinalAudio pakai surahId langsung (bukan surah yang belum tentu ada) ──
  const handleFinalAudio = useCallback((blob: Blob) => {
    const currentSurah = getSurah(surahId)
    analyze(blob, {
      surahName: currentSurah?.name ?? `Surah ${surahId}`,
      ayahStart,
      ayahEnd,
      mode: 'tahsin',
    })
  }, [surahId, ayahStart, ayahEnd, analyze])

  const { isRecording, startRecording, stopRecording } = useQuranRecorder({
    onTranscript: handleTranscript,
    onError: handleError,
    onFinalAudio: handleFinalAudio,
  })

  // ── Audio player ──
  const playAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    const audio = audioRef.current

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

   const audioUrl = getAudioUrl(surahId)
    if (!audioUrl) return

    audio.src = audioUrl
    audio.play().then(() => {
      setIsPlaying(true)
      setHasListened(true)
    }).catch(console.error)

    audio.onended = () => {
      setIsPlaying(false)
      setHasListened(true)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      setErrorMessage('')
      setLiveTranscript('')
      wordStatesRef.current = wordsRef.current.map(() => 'idle')
      mistakesRef.current = []
      currentIndexRef.current = 0
      setWordStates(wordsRef.current.map(() => 'idle'))
      setCurrentIndex(0)
      setMistakes([])
      setAccuracy(null)
      resetFeedback()
      startTimeRef.current = Date.now()
      await startRecording()
    }
  }

  const resetAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setStep('listen')
    setIsPlaying(false)
    setHasListened(false)
    setWordStates([])
    wordStatesRef.current = []
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setMistakes([])
    mistakesRef.current = []
    setLiveTranscript('')
    setErrorMessage('')
    setAccuracy(null)
    resetFeedback()
  }

  const reloadWords = (sid: number, start: number, end: number) => {
    const w = buildWordList(sid, start, end)
    setWords(w)
    wordsRef.current = w
    resetAll()
  }

  const correctCount = wordStates.filter(s => s === 'correct').length
  const totalCount = words.length

  return (
    <div className="min-h-screen bg-[#F0F4F2] px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* ── Header ── */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-emerald-900 tracking-tighter">
            Tahsin <span className="text-emerald-500">· تحسين</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Dengarkan → Baca → AI koreksi tajwid & makhraj secara <em>live</em>
          </p>
        </div>

        {/* ── Selector ── */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Surah</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <select
                disabled={step === 'read' && isRecording}
                value={surahId}
                onChange={e => { const v = Number(e.target.value); setSurahId(v); reloadWords(v, ayahStart, ayahEnd) }}
                className="w-full p-3 bg-emerald-50 text-emerald-900 font-bold rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {Array.from({ length: 114 }, (_, i) => i + 1).map(n => {
                  const s = getSurah(n)
                  return <option key={n} value={n}>{n}. {s?.name ?? `Surah ${n}`}</option>
                })}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Ayat Mulai</label>
              <input
                type="number" min={1} max={ayahEnd} value={ayahStart}
                disabled={step === 'read' && isRecording}
                onChange={e => { const v = Math.max(1, Number(e.target.value)); setAyahStart(v); reloadWords(surahId, v, Math.max(v, ayahEnd)) }}
                className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold text-emerald-900 border-none outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Ayat Akhir</label>
              <input
                type="number" min={ayahStart} value={ayahEnd}
                disabled={step === 'read' && isRecording}
                onChange={e => { const v = Math.max(ayahStart, Number(e.target.value)); setAyahEnd(v); reloadWords(surahId, ayahStart, v) }}
                className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold text-emerald-900 border-none outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-emerald-50 rounded-2xl text-center">
                <p className="text-[9px] font-black text-emerald-600 uppercase">Kata</p>
                <p className="text-xl font-black text-emerald-900">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 1: Dengarkan ── */}
        {step === 'listen' && (
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center mx-auto">
                <Volume2 size={28} className="text-blue-500" />
              </div>
              <h3 className="font-black text-gray-800">Dengarkan Dulu</h3>
              <p className="text-sm text-gray-400">
                Dengarkan bacaan Mishary Rashid Alafasy sebelum mulai membaca
              </p>
            </div>

            <button
              onClick={playAudio}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Putar Audio</>}
            </button>

            <button
              onClick={() => setStep('read')}
              className={`w-full py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all border-2 ${
                hasListened
                  ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              disabled={!hasListened}
            >
              {hasListened ? '✓ Lanjut Baca' : 'Dengarkan Dulu'}
            </button>

            <button
              onClick={() => { setHasListened(true); setStep('read') }}
              className="w-full text-xs text-gray-300 hover:text-gray-500 font-bold py-2 transition-colors"
            >
              Lewati →
            </button>
          </div>
        )}

        {/* ── STEP 2 & 3: Baca + Done ── */}
        {(step === 'read' || step === 'done') && (
          <>
            {/* Mushaf */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-md relative">
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Surah {surah?.name} · Ayat {ayahStart}–{ayahEnd}
                </p>
              </div>

              {isRecording && (
                <div className="absolute top-5 right-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Live</span>
                </div>
              )}

              <div
                dir="rtl"
                className="flex flex-wrap gap-x-3 gap-y-4 justify-center"
                style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
              >
                {words.map((word, i) => {
                  const state = wordStates[i] ?? 'idle'
                  const isCurrent = i === currentIndex && isRecording
                  return (
                    <span
                      key={i}
                      className={`
                        text-2xl px-2 py-1 rounded-xl transition-all duration-300
                        ${isCurrent ? 'text-blue-600 bg-blue-50 scale-110' : ''}
                        ${state === 'correct' && !isCurrent ? 'text-emerald-600 bg-emerald-50' : ''}
                        ${state === 'wrong' ? 'text-red-500 bg-red-50 line-through decoration-red-400' : ''}
                        ${state === 'idle' && !isCurrent ? 'text-gray-700' : ''}
                      `}
                    >
                      {word.arabic}
                    </span>
                  )
                })}
              </div>

              {(isRecording || step === 'done') && (
                <div className="mt-6">
                  <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    <span>{correctCount} benar</span>
                    <span>{currentIndex}/{totalCount} kata</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (correctCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live transcript */}
            {(isRecording || liveTranscript) && (
              <div className="bg-emerald-950 rounded-[28px] p-6">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">Yang AI Dengar</p>
                <p
                  dir="rtl"
                  className="text-xl text-emerald-300 leading-relaxed min-h-[32px]"
                  style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                >
                  {liveTranscript || '...'}
                </p>
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-[24px] border border-red-100">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Tombol rekam */}
            <div className="flex gap-3">
              {step === 'read' && (
                <button
                  onClick={toggleRecording}
                  className={`
                    flex-1 flex items-center justify-center gap-3 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg
                    ${isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}
                  `}
                >
                  {isRecording ? <><MicOff size={18} /> Stop & Nilai</> : <><Mic size={18} /> Mulai Baca</>}
                </button>
              )}

              <button
                onClick={resetAll}
                disabled={isRecording}
                className="p-5 bg-white border border-gray-200 text-gray-500 rounded-[28px] hover:bg-gray-50 transition-all active:scale-95"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Hasil akurasi kata ── */}
        {/* FIX 4: pakai `step === 'done'` bukan `status === 'done'` */}
        {step === 'done' && accuracy !== null && (
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-md space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-black ${accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {accuracy}%
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                {accuracy >= 80 ? '🌟 Bacaan Sangat Baik!' : accuracy >= 50 ? '💪 Terus Berlatih' : '📖 Perlu Lebih Sering Diulang'}
              </p>
              {isSaving && <p className="text-xs text-gray-300 mt-2">Menyimpan sesi...</p>}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-emerald-600">{correctCount}</p>
                <p className="text-[9px] font-black text-emerald-400 uppercase">Benar</p>
              </div>
              <div className="bg-red-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-red-500">{mistakes.length}</p>
                <p className="text-[9px] font-black text-red-400 uppercase">Salah</p>
              </div>
              <div className="bg-blue-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-blue-600">{totalCount}</p>
                <p className="text-[9px] font-black text-blue-400 uppercase">Total</p>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Kata yang Perlu Diperbaiki</p>
                <div className="space-y-2">
                  {mistakes.slice(0, 5).map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-[16px]">
                      <span dir="rtl" className="text-lg text-red-600 font-semibold" style={{ fontFamily: "'Scheherazade New', serif" }}>
                        {m.wordArabic}
                      </span>
                      <span className="text-[9px] font-black text-red-400 uppercase">Ayat {m.ayahNumber}</span>
                    </div>
                  ))}
                  {mistakes.length > 5 && (
                    <p className="text-xs text-gray-400 text-center">+{mistakes.length - 5} kata lainnya</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Feedback Tajwid dari Gemini ── */}
            <TajwidFeedbackCard
              feedback={feedback}
              isLoading={feedbackLoading}
              onRetry={retry}
              accentColor="emerald"
            />

            <button
              onClick={resetAll}
              className="w-full py-4 rounded-[24px] bg-emerald-600 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95"
            >
              Ulangi Latihan
            </button>
          </div>
        )}

      </div>
    </div>
  )
}