export type QuranPracticeMode = 'ziyadah' | 'murojaah'
export type LegacyQuranMode = 'tahfidz' | 'tahsin'
export type QuranMode = QuranPracticeMode | LegacyQuranMode

export type WordState = 'idle' | 'current' | 'correct' | 'wrong' | 'missed'

export interface QuranChapter {
  id: number
  nameSimple: string
  nameArabic: string
  translatedName: string
  versesCount: number
  revelationPlace: string
}

export interface QuranWord {
  id?: number
  arabic: string
  simple?: string
  ayahNumber: number
  verseKey?: string
  wordIndex: number
  audioUrl?: string
}

export interface QuranVerse {
  id: number
  chapterId: number
  number: number
  verseKey: string
  textUthmani: string
  textSimple: string
  words: QuranWord[]
}

// Legacy shape retained while old routes redirect to the new practice flow.
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
  kind?: 'substitution' | 'omission' | 'insertion'
  confidence?: number
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
  transcript?: string
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
