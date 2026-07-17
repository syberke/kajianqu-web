'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, LoaderCircle, RotateCcw, Sparkles, XCircle } from 'lucide-react'

import type { QuranChapter } from '@/types/quran'

interface QuizQuestion {
  id: string
  type: 'sambung_ayat' | 'ayat_berikutnya' | 'nomor_ayat' | 'kata_hilang'
  title: string
  promptArabic: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface GeneratedQuiz {
  surahId: number
  surahName: string
  ayahStart: number
  ayahEnd: number
  generatedAt: string
  questions: QuizQuestion[]
}

export default function QuranQuizClient({ chapters }: { chapters: QuranChapter[] }) {
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? 1)
  const chapter = useMemo(() => chapters.find((item) => item.id === chapterId) ?? chapters[0], [chapterId, chapters])
  const [ayahStart, setAyahStart] = useState(1)
  const [ayahEnd, setAyahEnd] = useState(Math.min(7, chapter?.versesCount ?? 7))
  const [questionCount, setQuestionCount] = useState(5)
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const question = quiz?.questions[questionIndex]
  const answered = selectedAnswer !== null
  const isCorrect = selectedAnswer === question?.correctAnswer

  const selectChapter = (id: number) => {
    const next = chapters.find((item) => item.id === id)
    if (!next) return
    setChapterId(id)
    setAyahStart(1)
    setAyahEnd(Math.min(7, next.versesCount))
    setQuiz(null)
  }

  const generateQuiz = async () => {
    if (!chapter) return
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await fetch('/api/quran/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ surahId: chapter.id, ayahStart, ayahEnd, questionCount }),
      })
      const payload = (await response.json().catch(() => null)) as { quiz?: GeneratedQuiz; error?: string } | null
      if (!response.ok || !payload?.quiz) throw new Error(payload?.error ?? 'Gagal generate quiz')
      setQuiz(payload.quiz)
      setQuestionIndex(0)
      setSelectedAnswer(null)
      setCorrectCount(0)
      setWrongCount(0)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const answer = (option: string) => {
    if (!question || selectedAnswer !== null) return
    setSelectedAnswer(option)
    if (option === question.correctAnswer) setCorrectCount((value) => value + 1)
    else setWrongCount((value) => value + 1)
  }

  const nextQuestion = () => {
    if (!quiz) return
    setQuestionIndex((value) => Math.min(value + 1, quiz.questions.length - 1))
    setSelectedAnswer(null)
  }

  const totalAnswered = correctCount + wrongCount
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0
  const isLastQuestion = Boolean(quiz && questionIndex === quiz.questions.length - 1)

  return (
    <div className="min-h-screen bg-[#f4f8f6] pb-20 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Link href="/quran-ai" className="text-sm font-bold text-emerald-700 hover:underline">← Kembali ke Quran AI</Link>

        <section className="mt-5 rounded-[36px] bg-[#0f5b40] p-7 text-white shadow-2xl sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-200">Quran AI Quiz</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Generate quiz dari ayat pilihan</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">Soal sambung ayat, ayat berikutnya, nomor ayat, dan kata hilang dibuat dari teks Quran API pada rentang yang kamu pilih.</p></div>
            <Sparkles size={48} className="text-emerald-200" />
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">Generate Quiz</h2>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Surah</span><select value={chapterId} onChange={(event) => selectChapter(Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-emerald-500">{chapters.map((item) => <option key={item.id} value={item.id}>{item.id}. {item.nameSimple}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Dari ayat</span><input type="number" min={1} max={chapter?.versesCount} value={ayahStart} onChange={(event) => { const next = Number(event.target.value); setAyahStart(next); if (next > ayahEnd) setAyahEnd(next) }} className="h-12 w-full rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-emerald-500" /></label>
                <label className="space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Sampai</span><input type="number" min={ayahStart} max={chapter?.versesCount} value={ayahEnd} onChange={(event) => setAyahEnd(Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-emerald-500" /></label>
              </div>
              <label className="block space-y-2"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Jumlah soal</span><select value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-emerald-500"><option value={5}>5 soal</option><option value={10}>10 soal</option><option value={15}>15 soal</option><option value={20}>20 soal</option></select></label>
              <button type="button" onClick={() => void generateQuiz()} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f5b40] px-5 py-4 font-black text-white disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={19} /> : <Sparkles size={19} />} {loading ? 'Membuat quiz...' : quiz ? 'Generate Ulang' : 'Generate Quiz'}</button>
              {errorMessage && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
            </div>
          </aside>

          <main className="space-y-5">
            {quiz ? (
              <>
                <div className="grid grid-cols-3 gap-3"><ScoreCard label="Benar" value={correctCount} tone="emerald" /><ScoreCard label="Salah" value={wrongCount} tone="red" /><ScoreCard label="Akurasi" value={`${accuracy}%`} tone="slate" /></div>
                {question && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Soal {questionIndex + 1} dari {quiz.questions.length}</p><h2 className="mt-2 text-xl font-black text-slate-900">{question.title}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{quiz.surahName} {quiz.ayahStart}-{quiz.ayahEnd}</span></div>
                    <div className="mt-6 rounded-2xl bg-[#f8fbf9] p-5 text-right font-serif text-3xl leading-[2] text-slate-900 ring-1 ring-slate-100" dir="rtl">{question.promptArabic}</div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">{question.options.map((option) => { const correct = answered && option === question.correctAnswer; const wrong = answered && option === selectedAnswer && option !== question.correctAnswer; return <button key={option} type="button" disabled={answered} onClick={() => answer(option)} className={`rounded-2xl border p-4 text-center font-semibold transition ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : wrong ? 'border-red-500 bg-red-50 text-red-700' : answered ? 'border-slate-200 text-slate-400' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'}`}><span className={question.type === 'nomor_ayat' ? '' : 'font-serif text-xl leading-relaxed'} dir={question.type === 'nomor_ayat' ? 'ltr' : 'rtl'}>{option}</span></button> })}</div>
                    {answered && <div className={`mt-6 rounded-2xl p-5 ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}><div className="flex items-start gap-3">{isCorrect ? <CheckCircle2 className="mt-0.5 shrink-0" /> : <XCircle className="mt-0.5 shrink-0" />}<div><p className="font-black">{isCorrect ? 'Benar' : 'Belum tepat'}</p><p className="mt-1 text-sm leading-relaxed">{question.explanation}</p></div></div></div>}
                    {answered && <div className="mt-6 flex justify-end">{isLastQuestion ? <button type="button" onClick={() => void generateQuiz()} className="inline-flex items-center gap-2 rounded-xl bg-[#0f5b40] px-5 py-3 font-black text-white"><RotateCcw size={17} /> Generate Quiz Baru</button> : <button type="button" onClick={nextQuestion} className="rounded-xl bg-[#0f5b40] px-5 py-3 font-black text-white">Soal Berikutnya</button>}</div>}
                  </section>
                )}
              </>
            ) : (
              <div className="grid min-h-[520px] place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Sparkles size={29} /></span><h2 className="mt-5 text-2xl font-black text-slate-900">Belum ada quiz</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Pilih surah, rentang ayat, dan jumlah soal. Tekan Generate Quiz untuk membuat set soal baru.</p></div></div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({ label, value, tone }: { label: string; value: number | string; tone: 'emerald' | 'red' | 'slate' }) {
  const classes = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'red' ? 'bg-red-50 text-red-700' : 'bg-white text-slate-900'
  return <div className={`rounded-2xl border border-slate-200 p-4 text-center shadow-sm ${classes}`}><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider opacity-70">{label}</p></div>
}
