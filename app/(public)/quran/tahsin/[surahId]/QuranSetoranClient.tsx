'use client'



import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Mic, Square, RotateCcw, Volume2, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { QURAN_SURAHS, buildWordList, getSurah, getAudioUrl, compareWord } from '@/lib/quran-data'
import { useQuranRecorder } from '@/components/quran/useQuranRecorder'
import { saveSession } from '@/service/quran-session.service'
import { WordState, SessionMistake } from '@/types/quran'

const imgBasmallah = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bismillah_Calligraphy.svg/640px-Bismillah_Calligraphy.svg.png"

type Mode          = 'tahfidz' | 'tahsin'
type SessionStatus = 'modal' | 'idle' | 'listen' | 'recording' | 'processing' | 'done' | 'error'

interface SurahInfo {
  id:        number
  name:      string
  arabic:    string
  totalAyat: number
  type:      string
}

interface Props {
  mode:      Mode
  surahInfo: SurahInfo
  ayahStart: number
  ayahEnd:   number
}

const SURAH_OPTIONS = Object.values(QURAN_SURAHS).map(s => ({ id: s.id, name: s.name }))

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {[2,4,7,4,2,6,4,2,5,3,7,4,2].map((h, i) => (
        <div key={i}
          className={`w-1 rounded-full transition-all duration-300 ${active ? 'bg-[#1a7a53]' : 'bg-gray-300'}`}
          style={{ height: active ? `${h * 4}px` : '4px', animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

export default function QuranSetoranClient({ mode, surahInfo, ayahStart, ayahEnd }: Props) {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────────
  const [status,       setStatus]       = useState<SessionStatus>('modal')
  const [seconds,      setSeconds]      = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)


  const [words,        setWords]        = useState(() => buildWordList(surahInfo.id, ayahStart, ayahEnd))
  const [wordStates,   setWordStates]   = useState<WordState[]>(() => buildWordList(surahInfo.id, ayahStart, ayahEnd).map(() => 'idle'))
  const [mistakes,     setMistakes]     = useState<SessionMistake[]>([])
  const [showReview,   setShowReview]   = useState(false)
  const [isSaving,     setIsSaving]     = useState(false)
  const [errorMessage, setErrorMessage] = useState('')


  const [isPlaying,     setIsPlaying]     = useState(false)
  const [hasListened,   setHasListened]   = useState(false)
  const [currentIndex,  setCurrentIndex]  = useState(0)
  const [transcript,    setTranscript]    = useState('')

  const timerRef     = useRef<NodeJS.Timeout | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const audioRef     = useRef<HTMLAudioElement | null>(null)

  const currentIndexRef = useRef(0)
  const wordStatesRef   = useRef<WordState[]>([])
  const mistakesRef     = useRef<SessionMistake[]>([])
  const wordsRef        = useRef(words)

  const surahData = getSurah(surahInfo.id)

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
      if (status !== 'done') setSeconds(0)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2,'0')}.${String(s % 60).padStart(2,'0')} Menit`
  }

  // ─────────────────────────────────────────────────────────────────
  // TAHFIDZ LOGIC (dari quran-ai/tahfidz/page.tsx)
  // ─────────────────────────────────────────────────────────────────
  const handleTranscriptTahfidz = useCallback((text: string) => {
    setStatus('done')
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
          wordIndex:  currentWords[i].wordIndex,
        })
      }
    })

    setWordStates(newStates)
    setMistakes(newMistakes)
    setShowReview(true)

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct  = newStates.filter(s => s === 'correct').length
    const surah    = getSurah(surahInfo.id)

    setIsSaving(true)
    saveSession({
      mode:          'tahfidz',
      surahId:       surahInfo.id,
      surahName:     surah?.name ?? '',
      ayahStart,
      ayahEnd,
      totalWords:    currentWords.length,
      correctWords:  correct,
      accuracy:      currentWords.length > 0 ? (correct / currentWords.length) * 100 : 0,
      mistakes:      newMistakes,
      durationSeconds: duration,
    }).finally(() => setIsSaving(false))
  }, [surahInfo.id, ayahStart, ayahEnd])

  // ─────────────────────────────────────────────────────────────────
  // TAHSIN LOGIC (dari quran-ai/tahsin/page.tsx) - per kata realtime
  // ─────────────────────────────────────────────────────────────────
  const handleTranscriptTahsin = useCallback((text: string) => {
    setTranscript(text)
    const spokenWords = text.trim().split(/\s+/).filter(Boolean)

    spokenWords.forEach(spoken => {
      const idx = currentIndexRef.current
      if (idx >= wordsRef.current.length) return

      const expected  = wordsRef.current[idx]
      const isCorrect = compareWord(expected.arabic, spoken)
      wordStatesRef.current[idx] = isCorrect ? 'correct' : 'wrong'
      setWordStates([...wordStatesRef.current])

      if (!isCorrect) {
        const m: SessionMistake = {
          wordArabic: expected.arabic,
          wordSpoken: spoken,
          ayahNumber: expected.ayahNumber,
          wordIndex:  expected.wordIndex,
        }
        mistakesRef.current = [...mistakesRef.current, m]
        setMistakes([...mistakesRef.current])
      }

      currentIndexRef.current = idx + 1
      setCurrentIndex(idx + 1)

      if (idx + 1 >= wordsRef.current.length) finishTahsin()
    })
  }, [])

  const finishTahsin = async () => {
    await stopRecording()
    setStatus('done')
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct  = wordStatesRef.current.filter(s => s === 'correct').length
    const surah    = getSurah(surahInfo.id)
    setIsSaving(true)
    saveSession({
      mode:            'tahsin',
      surahId:         surahInfo.id,
      surahName:       surah?.name ?? '',
      ayahStart,
      ayahEnd,
      totalWords:      wordsRef.current.length,
      correctWords:    correct,
      accuracy:        wordsRef.current.length > 0 ? (correct / wordsRef.current.length) * 100 : 0,
      mistakes:        mistakesRef.current,
      durationSeconds: duration,
    }).finally(() => setIsSaving(false))
  }

  const handleError = useCallback((err: string) => {
    setErrorMessage(err)
    setStatus('error')
  }, [])

  const { isRecording, startRecording, stopRecording } = useQuranRecorder({
    onTranscript: mode === 'tahfidz' ? handleTranscriptTahfidz : handleTranscriptTahsin,
    onError:      handleError,
  })

  const handleStartRecord = async () => {
    setStatus('recording')
    setErrorMessage('')
    setShowReview(false)
    startTimeRef.current = Date.now()

    if (mode === 'tahfidz') {
      setWordStates(words.map(() => 'idle'))
      wordsRef.current = words
    } else {
      // tahsin: reset per-kata refs
      const w  = buildWordList(surahInfo.id, ayahStart, ayahEnd)
      const ws = w.map((): WordState => 'idle')
      setWords(w)
      setWordStates(ws)
      setCurrentIndex(0)
      setMistakes([])
      setTranscript('')
      wordsRef.current       = w
      wordStatesRef.current  = ws
      currentIndexRef.current = 0
      mistakesRef.current    = []
    }

    await startRecording()
  }

  const handleStopRecord = async () => {
    if (mode === 'tahfidz') {
      setStatus('processing')
      await stopRecording()
    } else {
      await finishTahsin()
    }
  }

  const handleReset = () => {
    const w = buildWordList(surahInfo.id, ayahStart, ayahEnd)
    setWords(w)
    setWordStates(w.map(() => 'idle'))
    setMistakes([])
    setShowReview(false)
    setStatus('idle')
    setErrorMessage('')
    setCurrentIndex(0)
    setTranscript('')
    setSeconds(0)
    wordsRef.current        = w
    wordStatesRef.current   = w.map(() => 'idle')
    currentIndexRef.current = 0
    mistakesRef.current     = []
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }
    const url   = getAudioUrl(surahInfo.id)
    const audio = new Audio(url)
    audioRef.current = audio
    setIsPlaying(true)
    audio.play().catch(() => { setIsPlaying(false); setHasListened(true) })
    audio.onended = () => { setIsPlaying(false); setHasListened(true); audioRef.current = null }
    setTimeout(() => setHasListened(true), 3000)
  }

  const handleSurahChange = (id: number) => {
    setShowDropdown(false)
    router.push(`/quran/${mode}/${id}?start=1&end=${QURAN_SURAHS[id]?.totalAyat || 7}`)
  }

  const correctCount = wordStates.filter(s => s === 'correct').length
  const accuracy     = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#edf7f3] pt-[72px] font-['Poppins',sans-serif] relative">

      {status === 'modal' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[540px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full opacity-50" />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-100 rounded-full opacity-40" />

            {/* Flow: mic → AI */}
            <div className="relative z-10 flex items-center justify-center gap-6 mb-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-24 h-24 rounded-full border-2 border-[#1a7a53] flex items-center justify-center bg-white shadow-sm">
                  <div className="w-12 h-12 bg-[#1a7a53] rounded-xl flex items-center justify-center">
                    <Mic size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 max-w-[90px] leading-relaxed">Bacaan mu akan di record oleh system</p>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-8 h-px bg-gray-400" />
                <div className="w-0 h-0 border-l-[6px] border-l-gray-400 border-y-[4px] border-y-transparent" />
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 max-w-[90px] leading-relaxed">AI akan mengoreksi bacaan kamu</p>
              </div>
            </div>

            <p className="relative z-10 text-gray-600 text-sm text-center leading-relaxed mb-8">
              Maksimal record <strong>30 menit.</strong> Ai akan mengoreksi bacaan kamu. Tekan tombol mikrofon untuk
              memulai tes kelancaran bacaanmu. Setelah kamu mulai membaca, sistem akan merekam
              dan menganalisis pelafalan, kelancaran, serta ketepatan tajwid secara otomatis.
            </p>

            <button
              onClick={() => setStatus(mode === 'tahsin' ? 'listen' : 'idle')}
              className="relative z-10 w-full bg-[#1a7a53] text-white font-semibold text-lg py-4 rounded-2xl hover:bg-[#15613f] active:scale-[0.98] transition-all"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          KONTEN UTAMA
      ════════════════════════════════════════════════ */}
      <div className="max-w-[800px] mx-auto px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/quran" className="text-gray-500 hover:text-[#1a7a53] transition-colors capitalize">
            {mode}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-bold">{surahInfo.name}</span>
        </div>

        {/* Header surat hijau */}
        <div className="bg-[#1a7a53] text-white rounded-2xl px-8 py-5 flex items-center justify-between">
          <p className="text-base font-semibold">Ayat {ayahStart}-{ayahEnd}</p>
          <div className="text-center">
            <p className="text-xl font-bold">{surahInfo.name}</p>
            <p className="text-white/70 text-sm">({surahData?.nameArabic || surahInfo.arabic || '–'})</p>
          </div>
          <p className="text-base font-semibold">{surahInfo.type}</p>
        </div>

        {/* Basmallah */}
        <div className="text-center py-2">
          <img src={imgBasmallah} alt="Basmallah" className="h-14 mx-auto object-contain" />
        </div>

        {/* ── Status bar kiri + Dropdown surat kanan ── */}
        <div className="flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-3">
            {status === 'recording' && (
              <>
                <button onClick={handleStopRecord}
                  className="w-9 h-9 bg-[#1a7a53] rounded-full flex items-center justify-center hover:bg-[#15613f] transition-colors"
                >
                  <Square size={12} className="text-white" fill="white" />
                </button>
                <span className="text-sm text-gray-700 font-medium">{formatTime(seconds)}</span>
                <span className="text-xs text-[#1a7a53] font-semibold">Maksimal 30 Menit</span>
              </>
            )}
            {status === 'processing' && (
              <>
                <div className="w-7 h-7 rounded-full border-[3px] border-[#1a7a53] border-t-transparent animate-spin" />
                <span className="text-sm text-[#1a7a53] font-medium">Menunggu Koreksi AI</span>
              </>
            )}
            {(status === 'done' || status === 'error') && (
              <button onClick={handleReset} className="flex items-center gap-1.5 text-[#1a7a53] text-sm font-semibold hover:underline">
                <RotateCcw size={14} /> Ulangi
              </button>
            )}
          </div>

          {/* Dropdown surat */}
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold text-gray-700 hover:border-[#1a7a53] transition-colors min-w-[140px] justify-between"
            >
              {surahInfo.name}
              <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
                {SURAH_OPTIONS.map(s => (
                  <button key={s.id} onClick={() => handleSurahChange(s.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors ${
                      s.id === surahInfo.id ? 'text-[#1a7a53] font-bold bg-emerald-50' : 'text-gray-700'
                    }`}
                  >
                    {s.id}. {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── TAHSIN: Dengar audio dulu ── */}
        {status === 'listen' && (
          <div className="bg-white border-2 border-[#1a7a53]/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={playAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a7a53] hover:bg-[#15613f]'
                }`}
              >
                <Volume2 size={22} className="text-white" />
              </button>
              <div>
                <p className="font-bold text-gray-800">Dengarkan Audio Terlebih Dahulu</p>
                <p className="text-gray-500 text-sm">
                  {isPlaying ? 'Sedang diputar... (Ustadz Alafasy)' : 'Tekan untuk mendengarkan bacaan referensi'}
                </p>
              </div>
            </div>
            {hasListened && (
              <button onClick={() => setStatus('idle')}
                className="w-full bg-[#1a7a53] text-white font-semibold py-3 rounded-xl hover:bg-[#15613f] transition-colors"
              >
                Mulai Setoran →
              </button>
            )}
          </div>
        )}

        {/* ── IDLE: card Mulai Setoran ── */}
        {status === 'idle' && (
          <div onClick={handleStartRecord}
            className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:border-[#1a7a53] hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-[#1a7a53] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mic size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">Mulai Setoran</p>
              <p className="text-gray-500 text-sm">Record hafalan kamu, AI akan mengoreksi salah benarnya.</p>
            </div>
          </div>
        )}

        {/* ── RECORDING: waveform ── */}
        {status === 'recording' && (
          <div className="bg-white border-2 border-[#1a7a53]/30 rounded-2xl p-6 flex items-center gap-4">
            <Waveform active={true} />
            <div className="flex-1" />
            <button onClick={handleStopRecord}
              className="w-12 h-12 bg-[#1a7a53] rounded-full flex items-center justify-center hover:bg-[#15613f] transition-colors"
            >
              <Square size={16} className="text-white" fill="white" />
            </button>
            <p className="font-bold text-gray-800 text-sm ml-2">Mulai baca</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMessage || 'Terjadi kesalahan. Coba lagi.'}</p>
          </div>
        )}

        {/* ── AYAT DISPLAY (processing/done) — pakai QuranWordDisplay logic ── */}
        {(status === 'processing' || status === 'done') && words.length > 0 && (
          <div className="space-y-6">
            {/* Ayat Arab dengan highlight per kata */}
            <div
              className="text-right text-3xl leading-loose"
              dir="rtl"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}
            >
              {words.map((w, i) => (
                <span key={i} className={`inline-block mx-1 transition-colors duration-300 ${
                  wordStates[i] === 'correct' ? 'text-emerald-600' :
                  wordStates[i] === 'wrong'   ? 'text-red-500 underline decoration-red-400' :
                  'text-gray-800'
                }`}>
                  {w.arabic}
                </span>
              ))}
            </div>

            {/* Progress bar untuk tahsin */}
            {mode === 'tahsin' && status !== 'done' && currentIndex > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a7a53] transition-all duration-300 rounded-full"
                    style={{ width: `${(currentIndex / words.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{currentIndex}/{words.length}</span>
              </div>
            )}
          </div>
        )}

        {/* ── REVIEW setelah selesai ── */}
        {status === 'done' && showReview && words.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Hasil Setoran</h3>

            {/* Skor */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black ${
                accuracy >= 80 ? 'bg-emerald-100 text-emerald-600' :
                accuracy >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-500'
              }`}>
                {accuracy}%
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  {correctCount} dari {words.length} kata benar
                </p>
                <p className="text-sm text-gray-500">
                  {accuracy >= 80 ? 'Luar biasa! Hafalanmu sudah sangat baik.' :
                   accuracy >= 60 ? 'Bagus! Terus berlatih untuk lebih baik.' :
                   'Perlu lebih banyak latihan. Jangan menyerah!'}
                </p>
              </div>
            </div>

            {/* Kesalahan */}
            {mistakes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600">Kata yang salah:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {mistakes.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-red-50 px-3 py-2 rounded-xl">
                      <span className="text-red-600 font-arabic text-base" dir="rtl">{m.wordArabic}</span>
                      <span className="text-gray-400 text-xs">kamu baca: "{m.wordSpoken}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSaving && <p className="text-xs text-gray-400 text-center">Menyimpan sesi...</p>}
          </div>
        )}

      </div>
    </div>
  )
}