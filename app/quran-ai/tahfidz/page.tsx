// ✅ TAHFIDZ — app/dashboard/siswa/quran-ai/tahfidz/page.tsx
// Perbedaan dari Tahsin:
// - TIDAK ada step "dengarkan dulu"
// - Langsung rekam hafalan
// - Tema warna BIRU (Tahsin = HIJAU)
// - Label "Setoran Hafalan", bukan "Latihan Tilawah"
'use client'
import TajwidFeedbackCard from '@/components/quran/TajwidFeedbackCard'
import { useTajwidFeedback } from '@/components/quran/useTajwidFeedback'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, RotateCcw, AlertCircle, Loader2, BookMarked } from 'lucide-react'
import { useQuranRecorder } from '@/components/quran/useQuranRecorder'
import { buildWordList, getSurah, compareWord } from '@/lib/quran-data'
import { saveSession } from '@/service/quran-session.service'
import { WordState, SessionMistake } from '@/types/quran'

type SessionStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export default function TahfidzPage() {
  const [surahId, setSurahId] = useState(1)
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(7)
  const [words, setWords] = useState(() => buildWordList(1, 1, 7))
  const [wordStates, setWordStates] = useState<WordState[]>(() => buildWordList(1, 1, 7).map(() => 'idle'))
  const [mistakes, setMistakes] = useState<SessionMistake[]>([])
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
const { feedback, isLoading, analyze, retry, reset } = useTajwidFeedback()
  const startTimeRef = useRef<number>(0)
  const wordsRef = useRef(words)
  const wordStatesRef = useRef<WordState[]>(wordStates)
  const mistakesRef = useRef<SessionMistake[]>([])

  useEffect(() => { wordsRef.current = words }, [words])
  useEffect(() => { wordStatesRef.current = wordStates }, [wordStates])

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setLiveTranscript(text)

    const spokenWords = text.trim().split(/\s+/).filter(Boolean)
    const currentWords = wordsRef.current
    const newStates: WordState[] = currentWords.map(() => 'idle')
    const newMistakes: SessionMistake[] = []

    spokenWords.forEach((spoken, i) => {
      if (i >= currentWords.length) return
      const isCorrect = compareWord(currentWords[i].arabic, spoken)
      newStates[i] = isCorrect ? 'correct' : 'wrong'
      if (!isCorrect) {
        newMistakes.push({
          wordArabic: currentWords[i].arabic,
          wordSpoken: spoken,
          ayahNumber: currentWords[i].ayahNumber,
          wordIndex: currentWords[i].wordIndex,
        })
      }
    })

    setWordStates(newStates)
    wordStatesRef.current = newStates
    mistakesRef.current = newMistakes

    if (isFinal) {
      setMistakes(newMistakes)
      const correct = newStates.filter(s => s === 'correct').length
      const acc = currentWords.length > 0 ? Math.round((correct / currentWords.length) * 100) : 0
      setAccuracy(acc)
      setStatus('done')

      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      const surah = getSurah(surahId)
      setIsSaving(true)
      saveSession({
        mode: 'tahfidz',
        surahId,
        surahName: surah?.name ?? '',
        ayahStart,
        ayahEnd,
        totalWords: currentWords.length,
        correctWords: correct,
        accuracy: acc,
        mistakes: newMistakes,
        durationSeconds: duration,
      }).finally(() => setIsSaving(false))
    }
  }, [surahId, ayahStart, ayahEnd])

  const handleError = useCallback((msg: string) => {
    setErrorMessage(msg)
    setStatus('error')
  }, [])

const { isRecording, startRecording, stopRecording } = useQuranRecorder({
  onTranscript: handleTranscript,
  onError: handleError,
  onFinalAudio: (blob) => analyze(blob, {    // ← tambah ini
    surahName: surah?.name ?? '',
    ayahStart,
    ayahEnd,
    mode: 'tahfidz', // atau 'tahsin'
  }),
})

  const toggleRecording = async () => {
    if (isRecording) {
      setStatus('processing')
      await stopRecording()
    } else {
      setErrorMessage('')
      setLiveTranscript('')
      setWordStates(wordsRef.current.map(() => 'idle'))
      setAccuracy(null)
      mistakesRef.current = []
      startTimeRef.current = Date.now()
      setStatus('recording')
      await startRecording()
    }
  }

  const resetSession = () => {
    setWordStates(words.map(() => 'idle'))
    setMistakes([])
    setLiveTranscript('')
    setStatus('idle')
    setErrorMessage('')
    setAccuracy(null)
    mistakesRef.current = []
  }

  const reloadWords = (sid: number, start: number, end: number) => {
    const w = buildWordList(sid, start, end)
    setWords(w)
    wordsRef.current = w
    setWordStates(w.map(() => 'idle'))
    wordStatesRef.current = w.map(() => 'idle')
    setMistakes([])
    setLiveTranscript('')
    setStatus('idle')
    setErrorMessage('')
    setAccuracy(null)
  }

  const surah = getSurah(surahId)
  const correctCount = wordStates.filter(s => s === 'correct').length
  const totalCount = words.length

  return (
    <div className="min-h-screen bg-[#EEF2FB] px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">

        {/* ── Header — BIRU, beda dari Tahsin yang HIJAU ── */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookMarked size={20} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mode Tahfidz</span>
          </div>
          <h1 className="text-2xl font-black text-blue-900 tracking-tighter">
            Setoran Hafalan <span className="text-blue-400">· حفظ</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Langsung rekam hafalanmu — AI cek kata per kata secara <em>live</em>
          </p>
          {/* Penanda visual beda dari Tahsin */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mt-1">
            ✦ Hafalan tanpa melihat teks
          </div>
        </div>

        {/* ── Selector ── */}
        <div className="bg-white rounded-[32px] p-6 border border-blue-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Surah & Rentang Ayat</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <select
                disabled={isRecording}
                value={surahId}
                onChange={e => { const v = Number(e.target.value); setSurahId(v); reloadWords(v, ayahStart, ayahEnd) }}
                className="w-full p-3 bg-blue-50 text-blue-900 font-bold rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
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
                disabled={isRecording}
                onChange={e => { const v = Math.max(1, Number(e.target.value)); setAyahStart(v); reloadWords(surahId, v, Math.max(v, ayahEnd)) }}
                className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold text-blue-900 border-none outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Ayat Akhir</label>
              <input
                type="number" min={ayahStart} value={ayahEnd}
                disabled={isRecording}
                onChange={e => { const v = Math.max(ayahStart, Number(e.target.value)); setAyahEnd(v); reloadWords(surahId, ayahStart, v) }}
                className="w-full p-3 bg-gray-50 rounded-2xl text-sm font-bold text-blue-900 border-none outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full p-3 bg-blue-50 rounded-2xl text-center">
                <p className="text-[9px] font-black text-blue-400 uppercase">Total Kata</p>
                <p className="text-xl font-black text-blue-900">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mushaf — DISEMBUNYIKAN saat idle, baru muncul setelah rekam ── */}
        {/* Ini beda dari Tahsin yang selalu tampilkan teks dari awal */}
        <div className="bg-white rounded-[40px] p-8 border border-blue-100 shadow-md min-h-[200px] relative">
          <div className="text-center mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              {surah?.name} · Ayat {ayahStart}–{ayahEnd}
            </p>
          </div>

          {/* Live indicator */}
          {isRecording && (
            <div className="absolute top-5 right-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Merekam</span>
            </div>
          )}

          {/* Teks Arab — selalu tampil sebagai referensi koreksi */}
          <div
            dir="rtl"
            className="flex flex-wrap gap-x-3 gap-y-4 justify-center"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
          >
            {words.map((word, i) => {
              const state = wordStates[i]
              return (
                <span
                  key={i}
                  className={`
                    text-2xl px-2 py-1 rounded-xl transition-all duration-300
                    ${state === 'correct' ? 'text-blue-600 bg-blue-50 scale-105' : ''}
                    ${state === 'wrong'   ? 'text-red-500 bg-red-50 line-through decoration-red-400' : ''}
                    ${state === 'idle'    ? isRecording ? 'text-gray-300' : 'text-gray-700' : ''}
                  `}
                >
                  {word.arabic}
                </span>
              )
            })}
          </div>

          {/* Idle state — instruksi */}
          {status === 'idle' && (
            <p className="text-center text-xs text-gray-300 font-bold uppercase tracking-widest mt-8">
              ↓ Tekan tombol di bawah untuk mulai setoran
            </p>
          )}

          {/* Progress */}
          {(isRecording || status === 'done') && (
            <div className="mt-6">
              <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                <span>{correctCount} hafal</span>
                <span>{totalCount - correctCount} perlu diulang</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (correctCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Live Transcript — BIRU, bukan hijau ── */}
        {(isRecording || liveTranscript) && (
          <div className="bg-blue-950 rounded-[28px] p-6">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">
              Yang AI Dengar
            </p>
            <p
              dir="rtl"
              className="text-xl text-blue-300 leading-relaxed min-h-[32px]"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
            >
              {liveTranscript || '...'}
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-[24px] border border-red-100">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* ── Tombol Rekam — label "Mulai Setoran" bukan "Mulai Baca" ── */}
        <div className="flex gap-3">
          <button
            onClick={toggleRecording}
            disabled={status === 'processing'}
            className={`
              flex-1 flex items-center justify-center gap-3 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg
              ${isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                : status === 'processing'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}
            `}
          >
            {status === 'processing' ? (
              <><Loader2 size={18} className="animate-spin" /> Memproses...</>
            ) : isRecording ? (
              <><MicOff size={18} /> Stop & Nilai</>
            ) : (
              <><Mic size={18} /> {status === 'done' ? 'Setoran Ulang' : 'Mulai Setoran'}</>
            )}
          </button>

          <button
            onClick={resetSession}
            disabled={isRecording}
            className="p-5 bg-white border border-blue-200 text-blue-400 rounded-[28px] hover:bg-blue-50 transition-all active:scale-95"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* ── Hasil Akhir ── */}
        {status === 'done' && accuracy !== null && (
          <div className="bg-white rounded-[40px] p-8 border border-blue-100 shadow-md space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-black ${accuracy >= 80 ? 'text-blue-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {accuracy}%
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                {accuracy >= 80 ? '🏆 Hafalan Sangat Baik!' : accuracy >= 50 ? '📖 Perlu Diulang Beberapa Kata' : '🔁 Ulangi Hafalanmu'}
              </p>
              {isSaving && <p className="text-xs text-gray-300 mt-2">Menyimpan sesi...</p>}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-blue-600">{correctCount}</p>
                <p className="text-[9px] font-black text-blue-400 uppercase">Hafal</p>
              </div>
              <div className="bg-red-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-red-500">{mistakes.length}</p>
                <p className="text-[9px] font-black text-red-400 uppercase">Salah</p>
              </div>
              <div className="bg-gray-50 rounded-[20px] p-4">
                <p className="text-2xl font-black text-gray-600">{totalCount}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase">Total</p>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Kata yang Perlu Diulang
                </p>
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
{status === 'done' && (
  <TajwidFeedbackCard
    feedback={feedback}
    isLoading={isLoading}
    onRetry={retry}
    accentColor="blue" // blue untuk tahfidz, emerald untuk tahsin
  />
)}
            <button
              onClick={resetSession}
              className="w-full py-4 rounded-[24px] bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
            >
              Setoran Ulang
            </button>
          </div>
        )}

      </div>
    </div>
  )
}