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

export type PublicAsatidz = {
  id: string
  nama: string
  fotoUrl: string | null
  title: string | null
  bidang: string | null
  bio: string | null
  teachingArea: string | null
  memorizationJuz: number | null
}

export type MaterialSummary = {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  level: string | null
  thumbnailUrl: string | null
  youtubeUrl: string | null
  publishedAt: string | null
}

export type PrivateClassSummary = {
  id: string
  asatidzId: string
  title: string
  description: string | null
  capacity: number
  price: number
  startsAt: string | null
  endsAt: string | null
  registrationStatus: string
}

export type LiveEventSummary = {
  id: string
  title: string
  description: string | null
  provider: 'youtube' | 'zoom' | 'external'
  startsAt: string
  estimatedMinutes: number | null
  eventUrl: string
  thumbnailUrl: string | null
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
}

export type DonationProgram = {
  id: string
  title: string
  slug: string
  category: string
  description: string
  targetAmount: number | null
}

export type PrayerItem = {
  id: string
  title: string
  arabicText: string
  transliteration: string | null
  translation: string
  virtue: string | null
  reference: string | null
  audioUrl: string | null
}

export type DhikrItem = PrayerItem & {
  period: 'morning' | 'evening' | 'general'
  repetitions: number
}

export type QuoteItem = {
  id: string
  content: string
  source: string | null
  publishDate: string | null
}

export type Profile = {
  id: string
  role: 'admin' | 'siswa' | 'asatidz'
  nama: string
  email: string
  noWa: string | null
  fotoUrl: string | null
  isActive: boolean
}

export type ChatRoom = {
  id: string
  roomType: 'direct' | 'class'
  classId: string | null
  title: string
  updatedAt: string
}

export type ChatMessage = {
  id: string
  roomId: string
  senderId: string
  replyToId: string | null
  content: string
  isPinned: boolean
  createdAt: string
}

export type DiscussionTopic = {
  id: string
  title: string
  content: string
  category: string | null
  status: string
  createdAt: string
}

export type Achievement = {
  id: string
  code: string
  title: string
  description: string
  icon: string | null
  targetRole: string | null
}

function asNumber(value: unknown): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : 0
}

function requireConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Isi environment aplikasi lebih dahulu.')
  }
  return getSupabase()
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, nama, email, no_wa, foto_url, is_active')
    .eq('id', userData.user.id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    id: String(data.id),
    role: data.role as Profile['role'],
    nama: String(data.nama),
    email: String(data.email),
    noWa: data.no_wa ? String(data.no_wa) : null,
    fotoUrl: data.foto_url ? String(data.foto_url) : null,
    isActive: Boolean(data.is_active),
  }
}

export async function updateCurrentProfile(input: { nama: string; noWa?: string; fotoUrl?: string }) {
  const supabase = requireConfigured()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Silakan masuk untuk memperbarui profil.')
  const { error } = await supabase
    .from('profiles')
    .update({
      nama: input.nama.trim(),
      no_wa: input.noWa?.trim() || null,
      foto_url: input.fotoUrl?.trim() || null,
    })
    .eq('id', userData.user.id)
  if (error) throw new Error(error.message)
}

export async function signOut() {
  if (!isSupabaseConfigured()) return
  const { error } = await getSupabase().auth.signOut()
  if (error) throw new Error(error.message)
}

export async function listPublicAsatidz(): Promise<PublicAsatidz[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('asatidz_public_directory')
    .select('id, nama, foto_url, title, bidang, bio, teaching_area, memorization_juz')
    .order('nama', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    nama: String(row.nama),
    fotoUrl: row.foto_url ? String(row.foto_url) : null,
    title: row.title ? String(row.title) : null,
    bidang: row.bidang ? String(row.bidang) : null,
    bio: row.bio ? String(row.bio) : null,
    teachingArea: row.teaching_area ? String(row.teaching_area) : null,
    memorizationJuz: row.memorization_juz === null ? null : asNumber(row.memorization_juz),
  }))
}

export async function listPublishedMaterials(limit = 24): Promise<MaterialSummary[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('materials')
    .select('id, title, slug, summary, description, level, thumbnail_url, youtube_url, published_at')
    .eq('is_published', true)
    .eq('review_status', 'approved')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    summary: row.summary ? String(row.summary) : null,
    description: row.description ? String(row.description) : null,
    level: row.level ? String(row.level) : null,
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    youtubeUrl: row.youtube_url ? String(row.youtube_url) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
  }))
}

export async function listPrivateClasses(): Promise<PrivateClassSummary[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('private_classes')
    .select('id, asatidz_id, title, description, capacity, price, starts_at, ends_at, registration_status')
    .in('registration_status', ['open', 'ongoing'])
    .order('starts_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    asatidzId: String(row.asatidz_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    capacity: asNumber(row.capacity),
    price: asNumber(row.price),
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    registrationStatus: String(row.registration_status),
  }))
}

export async function joinPrivateClass(classId: string) {
  const supabase = requireConfigured()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Silakan masuk untuk mendaftar kelas.')
  const { error } = await supabase.from('class_members').insert({
    class_id: classId,
    user_id: userData.user.id,
    status: 'pending',
  })
  if (error && error.code !== '23505') throw new Error(error.message)
}

export async function ensureClassChat(classId: string): Promise<string> {
  const supabase = requireConfigured()
  const { data, error } = await supabase.rpc('ensure_class_chat', { target_class_id: classId })
  if (error) throw new Error(error.message)
  return String(data)
}

export async function listLiveEvents(): Promise<LiveEventSummary[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('live_events')
    .select('id, title, description, provider, starts_at, estimated_minutes, event_url, thumbnail_url, status')
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    provider: row.provider as LiveEventSummary['provider'],
    startsAt: String(row.starts_at),
    estimatedMinutes: row.estimated_minutes === null ? null : asNumber(row.estimated_minutes),
    eventUrl: String(row.event_url),
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    status: row.status as LiveEventSummary['status'],
  }))
}

export async function listDonationPrograms(): Promise<DonationProgram[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('donation_programs')
    .select('id, title, slug, category, description, target_amount')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    category: String(row.category),
    description: String(row.description),
    targetAmount: row.target_amount === null ? null : asNumber(row.target_amount),
  }))
}

export async function createDonationTransaction(input: {
  programId: string
  amount: number
  paymentMethod: 'bank_transfer' | 'qris' | 'ewallet'
  idempotencyKey: string
}) {
  const { data, error } = await requireConfigured().rpc('create_donation_transaction', {
    target_program_id: input.programId,
    donation_amount: input.amount,
    selected_payment_method: input.paymentMethod,
    request_idempotency_key: input.idempotencyKey,
  })
  if (error) throw new Error(error.message)
  return Array.isArray(data) ? data[0] : data
}

export async function listDailyPrayers(): Promise<PrayerItem[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('daily_prayers')
    .select('id, title, arabic_text, transliteration, translation, virtue, reference, audio_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    arabicText: String(row.arabic_text),
    transliteration: row.transliteration ? String(row.transliteration) : null,
    translation: String(row.translation),
    virtue: row.virtue ? String(row.virtue) : null,
    reference: row.reference ? String(row.reference) : null,
    audioUrl: row.audio_url ? String(row.audio_url) : null,
  }))
}

export async function listDhikr(): Promise<DhikrItem[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('dhikr_items')
    .select('id, period, title, arabic_text, transliteration, translation, repetitions, reference')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    period: row.period as DhikrItem['period'],
    title: String(row.title),
    arabicText: String(row.arabic_text),
    transliteration: row.transliteration ? String(row.transliteration) : null,
    translation: String(row.translation),
    virtue: null,
    reference: row.reference ? String(row.reference) : null,
    audioUrl: null,
    repetitions: asNumber(row.repetitions),
  }))
}

export async function listQuotes(): Promise<QuoteItem[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('quotes')
    .select('id, content, source, publish_date')
    .eq('is_published', true)
    .order('publish_date', { ascending: false, nullsFirst: false })
    .limit(30)
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    content: String(row.content),
    source: row.source ? String(row.source) : null,
    publishDate: row.publish_date ? String(row.publish_date) : null,
  }))
}

export async function listDiscussionTopics(kind: 'bahtsul' | 'muamalat'): Promise<DiscussionTopic[]> {
  if (!isSupabaseConfigured()) return []
  const table = kind === 'bahtsul' ? 'bahtsul_topics' : 'muamalat_topics'
  const { data, error } = await getSupabase()
    .from(table)
    .select('id, title, content, category, status, created_at')
    .neq('status', 'hidden')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    content: String(row.content),
    category: row.category ? String(row.category) : null,
    status: String(row.status),
    createdAt: String(row.created_at),
  }))
}

export async function listAchievements(): Promise<Achievement[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('achievements')
    .select('id, code, title, description, icon, target_role')
    .eq('is_active', true)
    .order('title', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    code: String(row.code),
    title: String(row.title),
    description: String(row.description),
    icon: row.icon ? String(row.icon) : null,
    targetRole: row.target_role ? String(row.target_role) : null,
  }))
}

export async function listChatRooms(): Promise<ChatRoom[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('chat_rooms')
    .select('id, room_type, class_id, title, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    roomType: row.room_type as ChatRoom['roomType'],
    classId: row.class_id ? String(row.class_id) : null,
    title: String(row.title),
    updatedAt: String(row.updated_at),
  }))
}

export async function listChatMessages(roomId: string): Promise<ChatMessage[]> {
  const { data, error } = await requireConfigured()
    .from('chat_messages')
    .select('id, room_id, sender_id, reply_to_id, content, is_pinned, created_at')
    .eq('room_id', roomId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: String(row.id),
    roomId: String(row.room_id),
    senderId: String(row.sender_id),
    replyToId: row.reply_to_id ? String(row.reply_to_id) : null,
    content: String(row.content),
    isPinned: Boolean(row.is_pinned),
    createdAt: String(row.created_at),
  }))
}

export async function sendChatMessage(roomId: string, content: string) {
  const supabase = requireConfigured()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('Silakan masuk untuk mengirim pesan.')
  const cleanContent = content.trim()
  if (!cleanContent || cleanContent.length > 4000) throw new Error('Pesan harus berisi 1 sampai 4000 karakter.')
  const { error } = await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userData.user.id,
    content: cleanContent,
    message_type: 'text',
  })
  if (error) throw new Error(error.message)
}

export function subscribeToChatRoom(roomId: string, onChange: () => void) {
  if (!isSupabaseConfigured()) return null
  const supabase = requireConfigured()
  return supabase
    .channel(`chat-room:${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
      onChange,
    )
    .subscribe()
}

export async function listQuranHistory() {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await getSupabase()
    .from('quran_sessions')
    .select('id, mode, surah_id, surah_name, ayah_start, ayah_end, accuracy, duration_seconds, created_at')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveQuranSession(input: {
  mode: 'murojaah' | 'belajar'
  surahId: number
  surahName: string
  ayahStart: number
  ayahEnd: number
  totalWords: number
  correctWords: number
  accuracy: number
  mistakes: unknown
  durationSeconds: number
  transcript: string
}) {
  const supabase = requireConfigured()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null
  const { data, error } = await supabase
    .from('quran_sessions')
    .insert({
      user_id: userData.user.id,
      mode: input.mode,
      surah_id: input.surahId,
      surah_name: input.surahName,
      ayah_start: input.ayahStart,
      ayah_end: input.ayahEnd,
      total_words: input.totalWords,
      correct_words: input.correctWords,
      accuracy: input.accuracy,
      mistakes: input.mistakes,
      duration_seconds: input.durationSeconds,
      transcript: input.transcript,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data
}
