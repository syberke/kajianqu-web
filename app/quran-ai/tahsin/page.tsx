// app/quran-ai/tahsin/page.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Pause, Mic, MicOff, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SurahSelector } from '@/components/quran/SurahSelector'
import { QuranWordDisplay } from '@/components/quran/QuranWordDisplay'
import { SessionReview } from '@/components/quran/SessionReview'
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
  const [transcript, setTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef(0)
  const currentIndexRef = useRef(0)
  const wordStatesRef = useRef<WordState[]>([])
  const mistakesRef = useRef<SessionMistake[]>([])
  const wordsRef = useRef(words)

  const syncRefs = (w = words, ws = wordStates, ci = currentIndex, m = mistakes) => {
    wordsRef.current = w
    wordStatesRef.current = ws
    currentIndexRef.current = ci
    mistakesRef.current = m
  }

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text)
    const spokenWords = text.trim().split(/\s+/).filter(Boolean)

    spokenWords.forEach(spoken => {
      const idx = currentIndexRef.current
      if (idx >= wordsRef.current.length) return

      const expected = wordsRef.current[idx]
      const isCorrect = compareWord(expected.arabic, spoken)
      wordStatesRef.current[idx] = isCorrect ? 'correct' : 'wrong'
      setWordStates([...wordStatesRef.current])

      if (!isCorrect) {
        const m: SessionMistake = {
          wordArabic: expected.arabic,
          wordSpoken: spoken,
          ayahNumber: expected.ayahNumber,
          wordIndex: expected.wordIndex,
        }
        mistakesRef.current = [...mistakesRef.current, m]
        setMistakes([...mistakesRef.current])
      }

      currentIndexRef.current = idx + 1
      setCurrentIndex(idx + 1)

      if (idx + 1 >= wordsRef.current.length) finishSession()
    })
  }, [])

  const handleError = useCallback((err: string) => setErrorMessage(err), [])

  const { isRecording, startRecording, stopRecording } = useQuranRecorder({
    onTranscript: handleTranscript,
    onError: handleError,
  })

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    const audio = new Audio(getAudioUrl(surahId))
    audioRef.current = audio
    setIsPlaying(true)

    audio.onended = () => {
      setIsPlaying(false)
      setHasListened(true)
      audioRef.current = null
    }

    audio.onerror = () => {
      setIsPlaying(false)
      audioRef.current = null
      // Tetap allow lanjut meski audio gagal
      setHasListened(true)
    }

    audio.play().catch(() => {
      setIsPlaying(false)
      setHasListened(true)
    })

    // Enable after 3 detik jaga-jaga
    setTimeout(() => setHasListened(true), 3000)
  }

  const goToRead = () => {
    const w = buildWordList(surahId, ayahStart, ayahEnd)
    const ws = w.map((): WordState => 'idle')
    setWords(w)
    setWordStates(ws)
    setCurrentIndex(0)
    setMistakes([])
    setTranscript('')
    setStep('read')
    syncRefs(w, ws, 0, [])
  }

  const finishSession = async () => {
    await stopRecording()
    setStep('done')

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct = wordStatesRef.current.filter(s => s === 'correct').length
    const surah = getSurah(surahId)

    setIsSaving(true)
    await saveSession({
      mode: 'tahsin',
      surahId,
      surahName: surah?.name ?? '',
      ayahStart,
      ayahEnd,
      totalWords: wordsRef.current.length,
      correctWords: correct,
      accuracy: wordsRef.current.length > 0 ? (correct / wordsRef.current.length) * 100 : 0,
      mistakes: mistakesRef.current,
      durationSeconds: duration,
    })
    setIsSaving(false)
  }

  const resetAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setStep('listen')
    setIsPlaying(false)
    setHasListened(false)
    setWordStates([])
    setCurrentIndex(0)
    setMistakes([])
    setTranscript('')
    setErrorMessage('')
  }

  const handleSurahChange = (id: number) => {
    setSurahId(id)
    resetAll()
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      setErrorMessage('')
      startTimeRef.current = Date.now()
      await startRecording()
    }
  }

  const surah = getSurah(surahId)
  const latinAll = surah?.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.latin).join('  ') ?? ''
  const correctCount = wordStates.filter(s => s === 'correct').length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-medium">Tahsin — Latihan Tilawah</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dengarkan pengajaran dulu, lalu baca dan AI akan mengoreksi bacaanmu
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pilih Surah & Ayat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SurahSelector
            surahId={surahId}
            ayahStart={ayahStart}
            ayahEnd={ayahEnd}
            onSurahChange={handleSurahChange}
            onAyahStartChange={(n) => { setAyahStart(n); resetAll() }}
            onAyahEndChange={(n) => { setAyahEnd(n); resetAll() }}
            disabled={step === 'read' || isRecording}
          />

          {/* Step 1: Dengarkan */}
          {step === 'listen' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{surah?.name} — Mishary Rashid Alafasy</p>
                  <p className="text-xs text-muted-foreground">
                    {isPlaying ? 'Sedang diputar...' : 'Klik untuk mendengarkan'}
                  </p>
                </div>
                {hasListened && (
                  <Badge variant="secondary" className="gap-1 text-green-600 dark:text-green-400 shrink-0">
                    <CheckCircle2 size={12} />
                    Sudah didengar
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <Volume2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Dengarkan pengajaran minimal sekali sebelum membaca. Perhatikan makhraj dan tajwid.
                </p>
              </div>

              <Button onClick={goToRead} disabled={!hasListened} className="w-full">
                Lanjut Baca
              </Button>
            </div>
          )}

          {/* Step 2: Baca */}
          {(step === 'read' || step === 'done') && (
            <div className="space-y-3">
              <QuranWordDisplay
                words={words}
                states={wordStates}
                currentIndex={currentIndex}
                latin={latinAll}
              />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Bacaan kamu</p>
                <div
                  className="min-h-[40px] p-3 rounded-lg bg-muted/50 text-right"
                  dir="rtl"
                  style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px' }}
                >
                  {transcript || <span className="text-muted-foreground/50 text-sm">—</span>}
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              )}

              {currentIndex > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(currentIndex / words.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{currentIndex}/{words.length}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={toggleRecording}
                  disabled={step === 'done'}
                  className="flex-1 gap-2"
                  variant={isRecording ? 'destructive' : 'default'}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  {isRecording ? 'Berhenti' : 'Mulai Baca'}
                </Button>
                <Button onClick={resetAll} variant="outline" size="icon">
                  <RotateCcw size={16} />
                </Button>
              </div>

              {isSaving && <p className="text-xs text-muted-foreground text-center">Menyimpan sesi...</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {step === 'done' && (
        <SessionReview
          totalWords={words.length}
          correctWords={correctCount}
          mistakes={mistakes}
          onRetry={resetAll}
        />
      )}
    </div>
  )
}