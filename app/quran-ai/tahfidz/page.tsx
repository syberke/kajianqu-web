// app/quran-ai/tahfidz/page.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SurahSelector } from '@/components/quran/SurahSelector'
import { QuranWordDisplay } from '@/components/quran/QuranWordDisplay'
import { SessionReview } from '@/components/quran/SessionReview'
import { useQuranRecorder } from '@/components/quran/useQuranRecorder'
import { buildWordList, getSurah, compareWord } from '@/lib/quran-data'
import { saveSession } from '@/service/quran-session.service'
import { WordState, SessionMistake } from '../../../types/quran'

type SessionStatus = 'idle' | 'recording' | 'done' | 'error'

export default function TahfidzPage() {
  const [surahId, setSurahId] = useState(1)
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(7)
  const [words, setWords] = useState(() => buildWordList(1, 1, 7))
  const [wordStates, setWordStates] = useState<WordState[]>(() => buildWordList(1, 1, 7).map(() => 'idle'))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mistakes, setMistakes] = useState<SessionMistake[]>([])
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [transcript, setTranscript] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const startTimeRef = useRef<number>(0)
  const currentIndexRef = useRef(0)
  const wordStatesRef = useRef<WordState[]>([])
  const mistakesRef = useRef<SessionMistake[]>([])
  const wordsRef = useRef(words)

  // Sync refs
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { wordStatesRef.current = wordStates }, [wordStates])
  useEffect(() => { mistakesRef.current = mistakes }, [mistakes])
  useEffect(() => { wordsRef.current = words }, [words])

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text)
    const spokenWords = text.trim().split(/\s+/).filter(Boolean)

    spokenWords.forEach(spoken => {
      const idx = currentIndexRef.current
      if (idx >= wordsRef.current.length) return

      const expected = wordsRef.current[idx]
      const isCorrect = compareWord(expected.arabic, spoken)
      const newState: WordState = isCorrect ? 'correct' : 'wrong'

      wordStatesRef.current = [...wordStatesRef.current]
      wordStatesRef.current[idx] = newState
      setWordStates([...wordStatesRef.current])

      if (!isCorrect) {
        const mistake: SessionMistake = {
          wordArabic: expected.arabic,
          wordSpoken: spoken,
          ayahNumber: expected.ayahNumber,
          wordIndex: expected.wordIndex,
        }
        mistakesRef.current = [...mistakesRef.current, mistake]
        setMistakes([...mistakesRef.current])
      }

      currentIndexRef.current = idx + 1
      setCurrentIndex(idx + 1)

      if (idx + 1 >= wordsRef.current.length) {
        finishSession()
      }
    })
  }, [])

  const handleError = useCallback((err: string) => {
    setErrorMessage(err)
    setStatus('error')
  }, [])

  const { isRecording, startRecording, stopRecording } = useQuranRecorder({
    onTranscript: handleTranscript,
    onError: handleError,
  })

  const reloadWords = useCallback((sId: number, aStart: number, aEnd: number) => {
    const w = buildWordList(sId, aStart, aEnd)
    setWords(w)
    setWordStates(w.map(() => 'idle'))
    setCurrentIndex(0)
    setMistakes([])
    setTranscript('')
    setShowReview(false)
    setStatus('idle')
    wordsRef.current = w
    wordStatesRef.current = w.map(() => 'idle')
    currentIndexRef.current = 0
    mistakesRef.current = []
  }, [])

  const handleSurahChange = (id: number) => {
    const surah = getSurah(id)
    if (!surah) return
    setSurahId(id)
    setAyahStart(1)
    setAyahEnd(surah.totalAyat)
    reloadWords(id, 1, surah.totalAyat)
  }

  const handleAyahStartChange = (n: number) => {
    setAyahStart(n)
    if (n > ayahEnd) setAyahEnd(n)
    reloadWords(surahId, n, Math.max(n, ayahEnd))
  }

  const handleAyahEndChange = (n: number) => {
    setAyahEnd(n)
    reloadWords(surahId, ayahStart, n)
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
      setStatus('idle')
    } else {
      setStatus('recording')
      setErrorMessage('')
      startTimeRef.current = Date.now()
      await startRecording()
    }
  }

  const finishSession = async () => {
    await stopRecording()
    setStatus('done')
    setShowReview(true)

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct = wordStatesRef.current.filter(s => s === 'correct').length
    const surah = getSurah(surahId)

    setIsSaving(true)
    await saveSession({
      mode: 'tahfidz',
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

  const resetSession = useCallback(() => {
    reloadWords(surahId, ayahStart, ayahEnd)
  }, [surahId, ayahStart, ayahEnd, reloadWords])

  const surah = getSurah(surahId)
  const latinAll = surah?.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.latin).join('  ') ?? ''
  const translationAll = surah?.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.translation).join(' — ') ?? ''
  const correctCount = wordStates.filter(s => s === 'correct').length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-medium">Tahfidz — Latihan Hafalan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Baca hafalan kamu, AI akan mendeteksi kesalahan secara realtime
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
            onAyahStartChange={handleAyahStartChange}
            onAyahEndChange={handleAyahEndChange}
            disabled={isRecording}
          />

          <QuranWordDisplay
            words={words}
            states={wordStates}
            currentIndex={currentIndex}
            latin={latinAll}
            translation={translationAll}
          />

          {/* Transcript realtime */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Bacaan kamu (realtime)</p>
            <div
              className="min-h-[40px] p-3 rounded-lg bg-muted/50 text-right"
              dir="rtl"
              style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px' }}
            >
              {transcript || <span className="text-muted-foreground/50 text-sm">—</span>}
            </div>
          </div>

          {/* Error message */}
          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Progress */}
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

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleRecording}
              disabled={status === 'done'}
              className="flex-1 gap-2"
              variant={isRecording ? 'destructive' : 'default'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              {isRecording ? 'Berhenti' : 'Mulai Baca'}
            </Button>

            <Button onClick={resetSession} variant="outline" size="icon">
              <RotateCcw size={16} />
            </Button>

            {status === 'done' && (
              <Badge className="gap-1" variant="secondary">
                <CheckCircle2 size={12} />
                {correctCount}/{words.length} benar
              </Badge>
            )}
          </div>

          {isSaving && (
            <p className="text-xs text-muted-foreground text-center">Menyimpan sesi...</p>
          )}
        </CardContent>
      </Card>

      {/* Review */}
      {showReview && (
        <SessionReview
          totalWords={words.length}
          correctWords={correctCount}
          mistakes={mistakes}
          onRetry={resetSession}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}