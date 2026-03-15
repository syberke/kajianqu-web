// app/quran-ai/quiz/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { Shuffle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QURAN_SURAHS, SURAH_LIST } from '@/lib/quran-data'
import { QuranSurah, QuranAyah } from '@/types/quran'

type QuizMode = 'sambung' | 'tebak'
type AnswerState = 'unanswered' | 'correct' | 'wrong'

interface Question {
  mode: QuizMode
  surah: QuranSurah
  ayah: QuranAyah
  prompt: string[]
  answer: string
  options: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateSambungQuestion(): Question {
  const surahList = Object.values(QURAN_SURAHS)
  const surah = surahList[Math.floor(Math.random() * surahList.length)]
  const ayah = surah.ayat[Math.floor(Math.random() * surah.ayat.length)]
  const cutIdx = Math.max(1, Math.floor(ayah.arabic.length / 2))

  const prompt = ayah.arabic.slice(0, cutIdx)
  const answer = ayah.arabic.slice(cutIdx).join(' ')

  // Buat opsi salah dari ayat lain
  const wrongOptions: string[] = []
  surahList.forEach(s => {
    s.ayat.forEach(a => {
      if (a !== ayah && a.arabic.length > cutIdx) {
        wrongOptions.push(a.arabic.slice(cutIdx).join(' '))
      }
    })
  })

  const options = shuffle([answer, ...shuffle(wrongOptions).slice(0, 3)])

  return { mode: 'sambung', surah, ayah, prompt, answer, options }
}

function generateTebakQuestion(): Question {
  const surahList = Object.values(QURAN_SURAHS)
  const surah = surahList[Math.floor(Math.random() * surahList.length)]
  const ayah = surah.ayat[Math.floor(Math.random() * surah.ayat.length)]

  const wrongSurahs = shuffle(surahList.filter(s => s.id !== surah.id)).slice(0, 3)
  const options = shuffle([surah.name, ...wrongSurahs.map(s => s.name)])

  return {
    mode: 'tebak',
    surah,
    ayah,
    prompt: ayah.arabic,
    answer: surah.name,
    options,
  }
}

export default function QuizPage() {
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [score, setScore] = useState({ correct: 0, wrong: 0 })

  const newQuestion = useCallback((mode: QuizMode) => {
    setQuestion(mode === 'sambung' ? generateSambungQuestion() : generateTebakQuestion())
    setSelected(null)
    setAnswerState('unanswered')
  }, [])

  const selectMode = (mode: QuizMode) => {
    setQuizMode(mode)
    setScore({ correct: 0, wrong: 0 })
    newQuestion(mode)
  }

  const handleAnswer = (opt: string) => {
    if (answerState !== 'unanswered' || !question) return
    setSelected(opt)
    const isCorrect = opt === question.answer
    setAnswerState(isCorrect ? 'correct' : 'wrong')
    setScore(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
    }))
  }

  const getOptionStyle = (opt: string): string => {
    if (answerState === 'unanswered') return ''
    if (opt === question?.answer) return 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
    if (opt === selected && answerState === 'wrong') return 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
    return 'opacity-50'
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-medium">Quiz Ayat Al-Quran</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Uji hafalan dengan quiz interaktif</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => selectMode('sambung')}
          className={`p-4 rounded-xl border text-left transition-all ${quizMode === 'sambung' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
        >
          <p className="font-medium text-sm">Sambung Ayat</p>
          <p className="text-xs text-muted-foreground mt-0.5">Lanjutkan penggalan ayat yang diberikan</p>
        </button>
        <button
          onClick={() => selectMode('tebak')}
          className={`p-4 rounded-xl border text-left transition-all ${quizMode === 'tebak' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
        >
          <p className="font-medium text-sm">Tebak Surah</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tebak nama surah dari ayat yang tampil</p>
        </button>
      </div>

      {/* Skor */}
      {quizMode && (
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{score.correct}</p>
            <p className="text-xs text-muted-foreground">Benar</p>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
            <p className="text-2xl font-semibold text-red-500 dark:text-red-400">{score.wrong}</p>
            <p className="text-xs text-muted-foreground">Salah</p>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-semibold">
              {score.correct + score.wrong > 0
                ? Math.round((score.correct / (score.correct + score.wrong)) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Akurasi</p>
          </div>
        </div>
      )}

      {/* Soal */}
      {question && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {question.mode === 'sambung' ? 'Lanjutkan ayat ini:' : 'Ayat ini dari surah apa?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Teks soal */}
            <div className="p-4 rounded-xl bg-muted/50 text-right" dir="rtl">
              <p style={{ fontFamily: "'Scheherazade New', serif", fontSize: '26px', lineHeight: '2' }}>
                {question.mode === 'sambung'
                  ? question.prompt.join(' ') + ' ...'
                  : question.ayah.arabic.join(' ')}
              </p>
              {question.mode === 'tebak' && (
                <p className="text-xs text-muted-foreground mt-1 text-left" dir="ltr">
                  {question.ayah.latin}
                </p>
              )}
            </div>

            {/* Opsi */}
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={answerState !== 'unanswered'}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all hover:bg-muted/50 disabled:cursor-default ${getOptionStyle(opt)}`}
                  style={
                    question.mode === 'sambung'
                      ? { fontFamily: "'Scheherazade New', serif", fontSize: '20px', direction: 'rtl', lineHeight: '1.8' }
                      : { fontSize: '14px' }
                  }
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {answerState !== 'unanswered' && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                answerState === 'correct'
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
              }`}>
                {answerState === 'correct'
                  ? <CheckCircle2 size={16} />
                  : <XCircle size={16} />}
                <p className="text-sm font-medium">
                  {answerState === 'correct' ? 'Benar!' : `Salah. Jawaban: ${question.answer}`}
                </p>
              </div>
            )}

            {/* Tombol lanjut */}
            {answerState !== 'unanswered' && (
              <Button
                onClick={() => newQuestion(question.mode)}
                className="w-full gap-2"
                variant="outline"
              >
                <Shuffle size={14} />
                Soal Berikutnya
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!quizMode && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Pilih mode quiz di atas untuk mulai
        </div>
      )}
    </div>
  )
}