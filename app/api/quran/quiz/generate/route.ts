import { NextResponse } from 'next/server'

import { getChapterVerses, getQuranChapters } from '@/lib/quran-api'
import { createClient } from '@/lib/supabase/server'
import type { QuranVerse } from '@/types/quran'

interface QuizRequest {
  surahId?: number
  ayahStart?: number
  ayahEnd?: number
  questionCount?: number
}

type QuizQuestionType = 'sambung_ayat' | 'ayat_berikutnya' | 'nomor_ayat' | 'kata_hilang'

interface QuizQuestion {
  id: string
  type: QuizQuestionType
  title: string
  promptArabic: string
  options: string[]
  correctAnswer: string
  explanation: string
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function uniqueOptions(correct: string, distractors: string[], limit = 4): string[] {
  const unique = Array.from(new Set([correct, ...shuffle(distractors).filter(Boolean)]))
  return shuffle(unique.slice(0, limit))
}

function secondHalf(verse: QuranVerse): string {
  const splitAt = Math.max(1, Math.ceil(verse.words.length / 2))
  return verse.words.slice(splitAt).map((word) => word.arabic).join(' ')
}

function buildQuestions(selected: QuranVerse[], allVerses: QuranVerse[], surahName: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const allTexts = allVerses.map((verse) => verse.textUthmani)
  const allSecondHalves = allVerses.filter((verse) => verse.words.length >= 4).map(secondHalf)
  const allWords = Array.from(new Set(allVerses.flatMap((verse) => verse.words.map((word) => word.arabic))))
  const verseByNumber = new Map(allVerses.map((verse) => [verse.number, verse]))

  selected.forEach((verse) => {
    const numberAnswer = String(verse.number)
    const numberDistractors = allVerses
      .filter((item) => item.number !== verse.number)
      .map((item) => String(item.number))
    questions.push({
      id: `nomor-${verse.id}`,
      type: 'nomor_ayat',
      title: 'Tebak Nomor Ayat',
      promptArabic: verse.textUthmani,
      options: uniqueOptions(numberAnswer, numberDistractors),
      correctAnswer: numberAnswer,
      explanation: `Ini adalah Surah ${surahName} ayat ${verse.number}.`,
    })

    if (verse.words.length >= 4) {
      const splitAt = Math.max(1, Math.ceil(verse.words.length / 2))
      const prompt = `${verse.words.slice(0, splitAt).map((word) => word.arabic).join(' ')} …`
      const answer = verse.words.slice(splitAt).map((word) => word.arabic).join(' ')
      questions.push({
        id: `sambung-${verse.id}`,
        type: 'sambung_ayat',
        title: 'Sambung Ayat',
        promptArabic: prompt,
        options: uniqueOptions(answer, allSecondHalves.filter((item) => item !== answer)),
        correctAnswer: answer,
        explanation: `Lanjutan yang benar berasal dari Surah ${surahName} ayat ${verse.number}.`,
      })

      const missingIndex = Math.min(verse.words.length - 1, Math.max(1, Math.floor(verse.words.length / 2)))
      const missingWord = verse.words[missingIndex]?.arabic
      if (missingWord) {
        questions.push({
          id: `kata-${verse.id}`,
          type: 'kata_hilang',
          title: 'Lengkapi Kata yang Hilang',
          promptArabic: verse.words.map((word, index) => index === missingIndex ? '﴿ … ﴾' : word.arabic).join(' '),
          options: uniqueOptions(missingWord, allWords.filter((word) => word !== missingWord)),
          correctAnswer: missingWord,
          explanation: `Kata yang hilang pada ayat ${verse.number} adalah ${missingWord}.`,
        })
      }
    }

    const nextVerse = verseByNumber.get(verse.number + 1)
    if (nextVerse && selected.some((item) => item.number === nextVerse.number)) {
      questions.push({
        id: `berikutnya-${verse.id}`,
        type: 'ayat_berikutnya',
        title: 'Ayat Berikutnya',
        promptArabic: verse.textUthmani,
        options: uniqueOptions(nextVerse.textUthmani, allTexts.filter((text) => text !== nextVerse.textUthmani)),
        correctAnswer: nextVerse.textUthmani,
        explanation: `Setelah ayat ${verse.number}, bacaan berlanjut ke ayat ${nextVerse.number}.`,
      })
    }
  })

  return shuffle(questions).filter((question) => question.options.length >= 2)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as QuizRequest | null
  const surahId = Number(payload?.surahId)
  const requestedCount = Number(payload?.questionCount ?? 5)
  const questionCount = Number.isFinite(requestedCount) ? Math.min(Math.max(Math.trunc(requestedCount), 3), 20) : 5

  const chapters = await getQuranChapters()
  const chapter = chapters.find((item) => item.id === surahId)
  if (!chapter) return NextResponse.json({ error: 'Surah tidak ditemukan' }, { status: 404 })

  const start = Math.max(1, Math.min(Number(payload?.ayahStart) || 1, chapter.versesCount))
  const end = Math.max(start, Math.min(Number(payload?.ayahEnd) || chapter.versesCount, chapter.versesCount))
  const allVerses = await getChapterVerses(chapter.id)
  const selected = allVerses.filter((verse) => verse.number >= start && verse.number <= end)
  const questions = buildQuestions(selected, allVerses, chapter.nameSimple).slice(0, questionCount)

  if (questions.length === 0) {
    return NextResponse.json({ error: 'Tidak cukup data ayat untuk membuat quiz pada rentang ini' }, { status: 422 })
  }

  return NextResponse.json({
    quiz: {
      surahId: chapter.id,
      surahName: chapter.nameSimple,
      ayahStart: start,
      ayahEnd: end,
      generatedAt: new Date().toISOString(),
      questions,
    },
  })
}
