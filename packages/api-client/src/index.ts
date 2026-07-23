import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import type { SurahSummary } from '@kajianku/quran-core'
import { fallbackSurahs } from '@kajianku/quran-core'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

let instance: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && publishableKey)
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }
  if (!instance) {
    instance = createClient(supabaseUrl!, publishableKey!, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  }
  return instance
}

type QuranChapterResponse = {
  chapters?: Array<{
    id: number
    name_simple: string
    name_arabic: string
    translated_name: { name: string }
    verses_count: number
    revelation_place: 'makkah' | 'madinah'
  }>
}

type QuranVersesResponse = {
  verses?: Array<{
    id: number
    verse_number: number
    text_uthmani: string
    translations?: Array<{ text: string }>
    audio?: { url: string }
  }>
  pagination?: { current_page: number; total_pages: number }
}

const quranBase = process.env.EXPO_PUBLIC_QURAN_API_BASE_URL || 'https://api.quran.com/api/v4'
const translationId = process.env.EXPO_PUBLIC_QURAN_TRANSLATION_ID || '134'
const recitationId = process.env.EXPO_PUBLIC_QURAN_RECITATION_ID || '7'

export async function listSurahs(): Promise<SurahSummary[]> {
  try {
    const response = await fetch(`${quranBase}/chapters?language=id`)
    if (!response.ok) throw new Error(`Quran API ${response.status}`)
    const payload = (await response.json()) as QuranChapterResponse
    return (payload.chapters || []).map((chapter) => ({
      id: chapter.id,
      nameSimple: chapter.name_simple,
      nameArabic: chapter.name_arabic,
      translatedName: chapter.translated_name.name,
      versesCount: chapter.verses_count,
      revelationPlace: chapter.revelation_place,
    }))
  } catch {
    return fallbackSurahs
  }
}

export async function getSurahVerses(surahNumber: number) {
  const url = new URL(`${quranBase}/verses/by_chapter/${surahNumber}`)
  url.searchParams.set('language', 'id')
  url.searchParams.set('translations', translationId)
  url.searchParams.set('audio', recitationId)
  url.searchParams.set('fields', 'text_uthmani')
  url.searchParams.set('per_page', '300')
  const response = await fetch(url)
  if (!response.ok) throw new Error('Ayat belum dapat dimuat. Periksa koneksi lalu coba lagi.')
  const payload = (await response.json()) as QuranVersesResponse
  return (payload.verses || []).map((verse) => ({
    id: verse.id,
    number: verse.verse_number,
    arabic: verse.text_uthmani,
    translation: verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') || '',
    audioUrl: verse.audio?.url ? `https://verses.quran.com/${verse.audio.url}` : null,
  }))
}

export type TranscriptionRequest = {
  audioUri: string
  mode: 'murojaah' | 'belajar'
  surahNumber: number
  ayahStart: number
  ayahEnd: number
}

export async function transcribeQuran(request: TranscriptionRequest): Promise<{ transcript: string; confidence: number | null }> {
  const supabase = getSupabase()
  const audioResponse = await fetch(request.audioUri)
  const audioBlob = await audioResponse.blob()
  const form = new FormData()
  form.append('audio', audioBlob, Platform.OS === 'web' ? 'bacaan.webm' : 'bacaan.m4a')
  form.append('mode', request.mode)
  form.append('surahNumber', String(request.surahNumber))
  form.append('ayahStart', String(request.ayahStart))
  form.append('ayahEnd', String(request.ayahEnd))

  const { data, error } = await supabase.functions.invoke('quran-transcribe', { body: form })
  if (error) throw new Error(error.message || 'Transkripsi belum berhasil')
  if (!data?.transcript) throw new Error('Tidak ada bacaan yang terdeteksi. Pastikan mikrofon dekat dan lingkungan tenang.')
  return {
    transcript: String(data.transcript),
    confidence: typeof data.confidence === 'number' ? data.confidence : null,
  }
}
