// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      quran_sessions: {
        Row: {
          id: string
          user_id: string
          mode: 'tahfidz' | 'tahsin'
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
        Insert: Omit<Database['public']['Tables']['quran_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quran_sessions']['Insert']>
      }
      quran_mistakes: {
        Row: {
          id: string
          session_id: string
          user_id: string
          surah_id: number
          ayah_number: number
          word_arabic: string
          word_spoken: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quran_mistakes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quran_mistakes']['Insert']>
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)