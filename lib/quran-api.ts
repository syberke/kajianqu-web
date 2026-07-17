import 'server-only'

import type { QuranChapter, QuranVerse, QuranWord } from '@/types/quran'

const QURAN_API_BASE_URL = process.env.QURAN_API_BASE_URL ?? 'https://api.quran.com/api/v4'
const QURAN_AUDIO_BASE_URL = 'https://verses.quran.com'
const DEFAULT_RECITATION_ID = process.env.QURAN_RECITATION_ID ?? '1'
const PAGE_SIZE = 50

interface ApiChapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  revelation_place: string
  translated_name?: { name?: string }
}

interface ApiWord {
  id?: number
  position: number
  text_uthmani?: string
  text_imlaei?: string
  verse_key?: string
  audio_url?: string
  char_type_name?: string
}

interface ApiVerse {
  id: number
  chapter_id?: number
  verse_number: number
  verse_key: string
  text_uthmani?: string
  text_uthmani_simple?: string
  text_imlaei_simple?: string
  audio?: {
    verse_key: string
    url: string
  }
  words?: ApiWord[]
}

interface ApiPagination {
  current_page: number
  total_pages: number
}

interface ApiVerseResponse {
  verses: ApiVerse[]
  pagination: ApiPagination
}

async function quranFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${QURAN_API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
  })

  if (!response.ok) {
    throw new Error(`Quran API gagal (${response.status}) untuk ${path}`)
  }

  return response.json() as Promise<T>
}

function normalizeAudioUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  return `${QURAN_AUDIO_BASE_URL}/${url.replace(/^\/+/, '')}`
}

export async function getQuranChapters(): Promise<QuranChapter[]> {
  const payload = await quranFetch<{ chapters: ApiChapter[] }>('/chapters?language=id')

  return payload.chapters.map((chapter) => ({
    id: chapter.id,
    nameSimple: chapter.name_simple,
    nameArabic: chapter.name_arabic,
    translatedName: chapter.translated_name?.name ?? chapter.name_simple,
    versesCount: chapter.verses_count,
    revelationPlace: chapter.revelation_place,
  }))
}

function mapVerse(verse: ApiVerse): QuranVerse {
  const verseAudioUrl = normalizeAudioUrl(verse.audio?.url)
  const words: QuranWord[] = (verse.words ?? [])
    .filter((word) => !word.char_type_name || word.char_type_name === 'word')
    .map((word, wordArrayIndex) => ({
      id: word.id,
      arabic: word.text_uthmani ?? word.text_imlaei ?? '',
      simple: word.text_imlaei ?? word.text_uthmani ?? '',
      ayahNumber: verse.verse_number,
      verseKey: word.verse_key ?? verse.verse_key,
      wordIndex: word.position - 1,
      audioUrl: verseAudioUrl
        ? wordArrayIndex === 0
          ? verseAudioUrl
          : undefined
        : normalizeAudioUrl(word.audio_url),
    }))
    .filter((word) => word.arabic.trim().length > 0)

  return {
    id: verse.id,
    chapterId: verse.chapter_id ?? Number(verse.verse_key.split(':')[0]),
    number: verse.verse_number,
    verseKey: verse.verse_key,
    textUthmani: verse.text_uthmani ?? words.map((word) => word.arabic).join(' '),
    textSimple:
      verse.text_uthmani_simple ??
      verse.text_imlaei_simple ??
      words.map((word) => word.simple ?? word.arabic).join(' '),
    audioUrl: verseAudioUrl,
    words,
  }
}

export async function getChapterVerses(chapterId: number): Promise<QuranVerse[]> {
  if (!Number.isInteger(chapterId) || chapterId < 1 || chapterId > 114) {
    throw new Error('Nomor surah tidak valid')
  }

  const query = new URLSearchParams({
    language: 'id',
    words: 'true',
    audio: DEFAULT_RECITATION_ID,
    fields: 'text_uthmani,text_uthmani_simple,text_imlaei_simple',
    word_fields: 'text_uthmani,text_imlaei,verse_key,position,audio_url,char_type_name',
    per_page: String(PAGE_SIZE),
  })

  const first = await quranFetch<ApiVerseResponse>(
    `/verses/by_chapter/${chapterId}?${query.toString()}&page=1`,
  )

  const pages: ApiVerseResponse[] = [first]
  for (let page = 2; page <= first.pagination.total_pages; page += 1) {
    pages.push(
      await quranFetch<ApiVerseResponse>(
        `/verses/by_chapter/${chapterId}?${query.toString()}&page=${page}`,
      ),
    )
  }

  return pages.flatMap((page) => page.verses).map(mapVerse)
}

export async function getQuranRange(
  chapterId: number,
  start: number,
  end: number,
): Promise<QuranVerse[]> {
  const verses = await getChapterVerses(chapterId)
  const safeStart = Math.max(1, Math.min(start, verses.length))
  const safeEnd = Math.max(safeStart, Math.min(end, verses.length))
  return verses.filter((verse) => verse.number >= safeStart && verse.number <= safeEnd)
}
