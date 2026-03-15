// types/quran.ts

export type QuranMode = 'tahfidz' | 'tahsin'

export type WordState = 'idle' | 'correct' | 'wrong' | 'current'

export interface QuranWord {
  arabic: string
  ayahNumber: number
  wordIndex: number
}

export interface QuranAyah {
  number: number
  arabic: string[]
  latin: string
  translation: string
  audioUrl?: string
}

export interface QuranSurah {
  id: number
  name: string
  nameArabic: string
  totalAyat: number
  ayat: QuranAyah[]
}

export interface SessionMistake {
  wordArabic: string
  wordSpoken: string
  ayahNumber: number
  wordIndex: number
}

export interface QuranSession {
  id?: string
  userId?: string
  mode: QuranMode
  surahId: number
  surahName: string
  ayahStart: number
  ayahEnd: number
  totalWords: number
  correctWords: number
  accuracy: number
  mistakes: SessionMistake[]
  durationSeconds?: number
  createdAt?: string
}

export interface SessionHistory {
  id: string
  mode: QuranMode
  surahName: string
  ayahStart: number
  ayahEnd: number
  accuracy: number
  correctWords: number
  totalWords: number
  createdAt: string
}

export interface TranscriptResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface WhisperResponse {
  text: string
  segments?: Array<{
    text: string
    start: number
    end: number
  }>
}