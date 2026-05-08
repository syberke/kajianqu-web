import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface QuranSessionRow {
  id: string
  user_id: string
  mode: string
  surah_id: number
  surah_name: string
  ayah_start: number
  ayah_end: number
  total_words: number
  correct_words: number
  accuracy: number
  mistakes: Array<{
    wordArabic: string
    wordSpoken: string
    ayahNumber: number
    wordIndex: number
  }>
  duration_seconds: number | null
  created_at: string
}

export type QuranSessionInsert = Omit<QuranSessionRow, 'id' | 'created_at'>

export interface QuranMistakeRow {
  id: string
  session_id: string
  user_id: string
  surah_id: number
  ayah_number: number
  word_arabic: string
  word_spoken: string
  created_at: string
}

export type QuranMistakeInsert = Omit<QuranMistakeRow, 'id' | 'created_at'>

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseAnonKey)