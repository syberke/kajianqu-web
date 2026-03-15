// service/quran-session.service.ts
import { supabase, QuranSessionInsert, QuranMistakeInsert, QuranSessionRow, QuranMistakeRow } from '@/lib/supabase'
import { QuranSession, SessionHistory, SessionMistake } from '@/types/quran'

export async function saveSession(
  session: Omit<QuranSession, 'id' | 'createdAt'>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const insertData: QuranSessionInsert = {
    user_id: user.id,
    mode: session.mode,
    surah_id: session.surahId,
    surah_name: session.surahName,
    ayah_start: session.ayahStart,
    ayah_end: session.ayahEnd,
    total_words: session.totalWords,
    correct_words: session.correctWords,
    accuracy: session.accuracy,
    mistakes: session.mistakes,
    duration_seconds: session.durationSeconds ?? null,
  }

  const { data, error } = await supabase
    .from('quran_sessions')
    .insert(insertData)
    .select('id')
    .single<Pick<QuranSessionRow, 'id'>>()

  if (error || !data) {
    console.error('Error saving session:', error)
    return null
  }

  // Simpan detail kesalahan per kata
  if (session.mistakes.length > 0) {
    const mistakeRows: QuranMistakeInsert[] = session.mistakes.map((m: SessionMistake) => ({
      session_id: data.id,
      user_id: user.id,
      surah_id: session.surahId,
      ayah_number: m.ayahNumber,
      word_arabic: m.wordArabic,
      word_spoken: m.wordSpoken,
    }))

    await supabase.from('quran_mistakes').insert(mistakeRows)
  }

  return data.id
}

export async function getSessionHistory(limit = 20): Promise<SessionHistory[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quran_sessions')
    .select('id, mode, surah_name, ayah_start, ayah_end, accuracy, correct_words, total_words, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<
      Pick<
        QuranSessionRow,
        | 'id'
        | 'mode'
        | 'surah_name'
        | 'ayah_start'
        | 'ayah_end'
        | 'accuracy'
        | 'correct_words'
        | 'total_words'
        | 'created_at'
      >[]
    >()

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    mode: row.mode,
    surahName: row.surah_name,
    ayahStart: row.ayah_start,
    ayahEnd: row.ayah_end,
    accuracy: row.accuracy,
    correctWords: row.correct_words,
    totalWords: row.total_words,
    createdAt: row.created_at,
  }))
}

export async function getMostMistakenWords(limit = 10) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quran_mistakes')
    .select('word_arabic, surah_id, ayah_number')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<Pick<QuranMistakeRow, 'word_arabic' | 'surah_id' | 'ayah_number'>[]>()

  if (error || !data) return []

  const freq: Record<
    string,
    { word: string; surahId: number; ayahNumber: number; count: number }
  > = {}

  data.forEach((row) => {
    const key = `${row.surah_id}-${row.ayah_number}-${row.word_arabic}`
    if (!freq[key]) {
      freq[key] = {
        word: row.word_arabic,
        surahId: row.surah_id,
        ayahNumber: row.ayah_number,
        count: 0,
      }
    }
    freq[key].count++
  })

  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}