// app/quran-ai/tahfidz/page.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SurahSelector } from '@/components/quran/SurahSelector'
import { QuranWordDisplay } from '@/components/quran/QuranWordDisplay'
import { SessionReview } from '@/components/quran/SessionReview'
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
  const [showReview, setShowReview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const startTimeRef = useRef<number>(0)

  const handleTranscript = useCallback((text: string) => {
    setStatus('done')
    const spokenWords = text.trim().split(/\s+/).filter(Boolean)
    const currentWords = words

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
    setMistakes(newMistakes)
    setShowReview(true)

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const correct = newStates.filter(s => s === 'correct').length
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
      accuracy: currentWords.length > 0 ? (correct / currentWords.length) * 100 : 0,
      mistakes: newMistakes,
      durationSeconds: duration,
    }).finally(() => setIsSaving(false))
  }, [words, surahId, ayahStart, ayahEnd])

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
    setMistakes([])
    setShowReview(false)
    setStatus('idle')
    setErrorMessage('')
  }, [])

  const handleSurahChange = (id: number) => {
    const surah = getSurah(id)
    if (!surah) return
    setSurahId(id)
    setAyahStart(1)
    setAyahEnd(surah.totalAyat)
    reloadWords(id, 1, surah.totalAyat)
  }

  const toggleRecording = async () => {
    if (isRecording) {
      setStatus('processing')
      await stopRecording()
    } else {
      setStatus('recording')
      setErrorMessage('')
      setShowReview(false)
      setWordStates(words.map(() => 'idle'))
      startTimeRef.current = Date.now()
      await startRecording()
    }
  }

  const resetSession = () => reloadWords(surahId, ayahStart, ayahEnd)

  const surah = getSurah(surahId)
  const latinAll = surah?.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.latin).join('  ') ?? ''
  const translationAll = surah?.ayat.slice(ayahStart - 1, ayahEnd).map(a => a.translation).join(' — ') ?? ''
  const correctCount = wordStates.filter(s => s === 'correct').length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-medium">Tahfidz — Latihan Hafalan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Baca hafalan kamu, AI akan mendeteksi kesalahan setelah kamu selesai
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
            onAyahStartChange={(n) => { setAyahStart(n); reloadWords(surahId, n, Math.max(n, ayahEnd)) }}
            onAyahEndChange={(n) => { setAyahEnd(n); reloadWords(surahId, ayahStart, n) }}
            disabled={isRecording}
          />

          <QuranWordDisplay
            words={words}
            states={wordStates}
            currentIndex={-1}
            latin={latinAll}
            translation={translationAll}
          />

          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={toggleRecording}
              disabled={status === 'processing'}
              className="flex-1 gap-2"
              variant={isRecording ? 'destructive' : 'default'}
            >
              {status === 'processing' ? (
                <><Loader2 size={16} className="animate-spin" /> Memproses...</>
              ) : isRecording ? (
                <><MicOff size={16} /> Selesai Baca</>
              ) : (
                <><Mic size={16} /> Mulai Baca</>
              )}
            </Button>

            <Button onClick={resetSession} variant="outline" size="icon" disabled={isRecording}>
              <RotateCcw size={16} />
            </Button>

            {status === 'done' && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 size={12} />
                {correctCount}/{words.length}
              </Badge>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Sedang merekam... klik &quot;Selesai Baca&quot; saat sudah selesai
              </p>
            </div>
          )}

          {isSaving && <p className="text-xs text-muted-foreground text-center">Menyimpan sesi...</p>}
        </CardContent>
      </Card>

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