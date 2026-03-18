'use client'

// app/(public)/quran/[mode]/[surahId]/QuranSetoranClient.tsx
// Sesuai screenshot 3-8:
// - Modal intro: icon mic → icon AI, deskripsi, tombol "Lanjutkan"
// - Header surat: "Ayat 1-10 | Nama Surat (arti) | Makkah/Madinah"
// - Basmallah (gambar Arab)
// - State idle:     card "Mulai Setoran" + icon mic
// - State recording: timer + stop button + waveform
// - State processing: spinner "Menunggu Koreksi AI" + teks ayat muncul
// - Dropdown pilih surat (Al-Baqarah ▼)

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Mic, Square, RotateCcw, Volume2, ChevronRight } from 'lucide-react'
import { QURAN_SURAHS, buildWordList, getSurah, compareWord } from '@/lib/quran-data'
import { useQuranRecorder } from '@/components/quran/useQuranRecorder'

// Basmallah image
const imgBasmallah = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bismillah_Calligraphy.svg/640px-Bismillah_Calligraphy.svg.png"

type Mode   = 'tahfidz' | 'tahsin'
type Status = 'modal' | 'idle' | 'listen' | 'recording' | 'processing' | 'done'

interface SurahInfo {
  id:        number
  name:      string
  arabic:    string
  totalAyat: number
  type:      string
}

interface Props {
  mode:       Mode
  surahInfo:  SurahInfo
  ayahStart:  number
  ayahEnd:    number
}

// Daftar surat untuk dropdown (sebagian)
const SURAH_OPTIONS = Object.values(QURAN_SURAHS).map(s => ({ id: s.id, name: s.name }))

// ── Waveform animasi saat recording ─────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {[3,5,8,5,3,7,5,3,6,4,8,5,3].map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-gray-400 transition-all ${active ? 'animate-pulse' : ''}`}
          style={{
            height: active ? `${h * 4}px` : '4px',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
export default function QuranSetoranClient({ mode, surahInfo, ayahStart, ayahEnd }: Props) {
  const router   = useRouter()
  const [status,      setStatus]      = useState<Status>('modal')
  const [seconds,     setSeconds]     = useState(0)
  const [transcript,  setTranscript]  = useState<string[]>([])
  const [wordStates,  setWordStates]  = useState<('idle'|'correct'|'wrong')[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasListened,  setHasListened]  = useState(false) // untuk tahsin: harus dengar dulu
  const [isPlaying,    setIsPlaying]    = useState(false)
  const timerRef  = useRef<NodeJS.Timeout | undefined>(undefined)
  const audioRef  = useRef<HTMLAudioElement | null>(null)

  // Build word list dari quran-data
  const words = QURAN_SURAHS[surahInfo.id]
    ? buildWordList(surahInfo.id, ayahStart, ayahEnd)
    : []

  // Ayat text untuk ditampilkan saat processing/done
  const surahData = getSurah(surahInfo.id)
  const ayatTexts = surahData
    ? surahData.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.arabic.join(' '))
    : []

  // Timer saat recording
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
    const sec = s % 60
    return `${String(m).padStart(2,'0')}.${String(sec).padStart(2,'0')} Menit`
  }

  // Handle transcript dari useQuranRecorder
  const handleTranscript = useCallback((text: string) => {
    setStatus('processing')
    // Simulasi processing sebentar lalu tampilkan hasil
    setTimeout(() => {
      const spokenWords = text.trim().split(/\s+/).filter(Boolean)
      setTranscript(spokenWords)

      if (words.length > 0) {
        const states = words.map((w, i) => {
          if (i >= spokenWords.length) return 'idle' as const
          return compareWord(w.arabic, spokenWords[i]) ? 'correct' as const : 'wrong' as const
        })
        setWordStates(states)
      }

      setStatus('done')
    }, 1500)
  }, [words])

  const handleError = useCallback((err: string) => {
    console.error('Recorder error:', err)
    setStatus('idle')
  }, [])

  const { isRecording, startRecording, stopRecording } = useQuranRecorder({
    onTranscript: handleTranscript,
    onError: handleError,
  })

  const handleStartRecord = async () => {
    setStatus('recording')
    setTranscript([])
    setWordStates([])
    await startRecording()
  }

  const handleStopRecord = async () => {
    setStatus('processing')
    await stopRecording()
  }

  const handleReset = () => {
    setStatus('idle')
    setTranscript([])
    setWordStates([])
    setSeconds(0)
  }

  // Audio untuk tahsin
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }
    const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahInfo.id}.mp3`
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

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#edf7f3] pt-[72px] font-['Poppins',sans-serif] relative">

      {/* ── MODAL INTRO (screenshot 3) ── */}
      {status === 'modal' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[540px] p-10 shadow-2xl overflow-hidden relative">
            {/* Dekorasi sudut hijau muda */}
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-emerald-100 rounded-full opacity-60" />
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-emerald-100 rounded-full opacity-40" />

            {/* Ilustrasi flow: mic → AI */}
            <div className="relative z-10 flex items-center justify-center gap-6 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-2 border-[#1a7a53] flex items-center justify-center bg-white">
                  <div className="w-12 h-12 bg-[#1a7a53] rounded-xl flex items-center justify-center">
                    <Mic size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 max-w-[100px]">
                  Bacaan mu akan di record oleh system
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="w-10 h-0.5 bg-gray-400 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-y-4 border-y-transparent" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 max-w-[100px]">
                  AI akan mengoreksi bacaan kamu
                </p>
              </div>
            </div>

            {/* Deskripsi */}
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

      {/* ── KONTEN UTAMA ── */}
      <div className="max-w-[800px] mx-auto px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/quran" className="text-gray-500 hover:text-[#1a7a53] transition-colors capitalize">
            {mode}
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-800 font-bold">{surahInfo.name}</span>
        </div>

        {/* Header surat — hijau (screenshot 4) */}
        <div className="bg-[#1a7a53] text-white rounded-2xl px-8 py-5 flex items-center justify-between">
          <p className="text-base font-semibold">Ayat {ayahStart}-{ayahEnd}</p>
          <div className="text-center">
            <p className="text-xl font-bold">{surahInfo.name}</p>
            <p className="text-white/70 text-sm">({surahInfo.arabic || 'Al-Qur\'an'})</p>
          </div>
          <p className="text-base font-semibold">{surahInfo.type}</p>
        </div>

        {/* Basmallah */}
        <div className="text-center py-2">
          <img src={imgBasmallah} alt="Basmallah" className="h-16 mx-auto object-contain" />
        </div>

        {/* ── Row: status/timer kiri + dropdown surat kanan ── */}
        <div className="flex items-center justify-between">
          {/* Kiri: status */}
          <div className="flex items-center gap-3">
            {status === 'idle' || status === 'listen' ? null : null}

            {status === 'recording' && (
              <>
                <button
                  onClick={handleStopRecord}
                  className="w-10 h-10 bg-[#1a7a53] rounded-full flex items-center justify-center hover:bg-[#15613f] transition-colors"
                >
                  <Square size={14} className="text-white" fill="white" />
                </button>
                <span className="text-gray-700 font-medium text-sm">{formatTime(seconds)}</span>
                <span className="text-[#1a7a53] text-xs font-semibold">Maksimal 30 Menit</span>
              </>
            )}

            {status === 'processing' && (
              <>
                <div className="w-8 h-8 rounded-full border-3 border-[#1a7a53] border-t-transparent animate-spin" 
                     style={{ borderWidth: '3px' }} />
                <span className="text-[#1a7a53] text-sm font-medium">Menunggu Koreksi AI</span>
              </>
            )}

            {status === 'done' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-[#1a7a53] text-sm font-semibold hover:underline"
              >
                <RotateCcw size={14} /> Ulangi
              </button>
            )}
          </div>

          {/* Kanan: dropdown surat */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold text-gray-700 hover:border-[#1a7a53] transition-colors min-w-[140px] justify-between"
            >
              {surahInfo.name}
              <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
                {SURAH_OPTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSurahChange(s.id)}
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

        {/* ── TAHSIN: dengar dulu sebelum record ── */}
        {mode === 'tahsin' && status === 'listen' && (
          <div className="bg-white border-2 border-[#1a7a53]/20 rounded-2xl p-6 flex items-center gap-4">
            <button
              onClick={playAudio}
              className="w-14 h-14 bg-[#1a7a53] rounded-full flex items-center justify-center hover:bg-[#15613f] transition-colors flex-shrink-0"
            >
              <Volume2 size={22} className="text-white" />
            </button>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Dengarkan Audio</p>
              <p className="text-gray-500 text-sm">{isPlaying ? 'Sedang diputar...' : 'Tekan untuk mendengarkan bacaan Ustadz Alafasy'}</p>
            </div>
            {hasListened && (
              <button
                onClick={() => setStatus('idle')}
                className="bg-[#1a7a53] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#15613f] transition-colors"
              >
                Mulai Setoran →
              </button>
            )}
          </div>
        )}

        {/* ── IDLE: card "Mulai Setoran" ── */}
        {status === 'idle' && (
          <div
            onClick={handleStartRecord}
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

        {/* ── RECORDING: waveform + stop ── */}
        {status === 'recording' && (
          <div className="bg-white border-2 border-[#1a7a53]/30 rounded-2xl p-6 flex items-center gap-4">
            <Waveform active={true} />
            <div className="flex-1" />
            <button
              onClick={handleStopRecord}
              className="w-12 h-12 bg-[#1a7a53] rounded-full flex items-center justify-center hover:bg-[#15613f] transition-colors"
            >
              <Square size={16} className="text-white" fill="white" />
            </button>
            <div className="ml-2">
              <p className="font-bold text-gray-800">Mulai baca</p>
            </div>
          </div>
        )}

        {/* ── PROCESSING/DONE: tampilkan ayat ── */}
        {(status === 'processing' || status === 'done') && ayatTexts.length > 0 && (
          <div className="text-right space-y-4">
            {ayatTexts.map((text, i) => (
              <p
                key={i}
                className="text-3xl leading-loose font-arabic text-gray-800"
                dir="rtl"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
              >
                {words.length > 0
                  ? buildWordList(surahInfo.id, ayahStart, ayahEnd)
                      .filter(w => w.ayahNumber === ayahStart + i)
                      .map((w, j) => {
                        const globalIdx = buildWordList(surahInfo.id, ayahStart, ayahEnd)
                          .findIndex(word => word.ayahNumber === w.ayahNumber && word.wordIndex === w.wordIndex)
                        const state = wordStates[globalIdx]
                        return (
                          <span
                            key={j}
                            className={`inline-block mx-1 transition-colors ${
                              state === 'correct' ? 'text-emerald-600' :
                              state === 'wrong'   ? 'text-red-500' :
                              'text-gray-800'
                            }`}
                          >
                            {w.arabic}
                          </span>
                        )
                      })
                  : text
                }
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}