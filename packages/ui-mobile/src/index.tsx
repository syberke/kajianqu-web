import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  AudioLines,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Compass,
  GraduationCap,
  HeartHandshake,
  Library,
  MessageCircle,
  Mic,
  Quote,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  Video,
  X,
} from 'lucide-react-native'
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { useQuery } from '@tanstack/react-query'
import {
  getSupabase,
  getSurahVerses,
  isSupabaseConfigured,
  listLiveEvents,
  listPrivateClasses,
  listPublishedMaterials,
  listPublicAsatidz,
  listSurahs,
  saveQuranSession,
  transcribeQuran,
} from '@kajianku/api-client'
import { compareRecitation, fallbackSurahs, type QuranPracticeResult } from '@kajianku/quran-core'
import { colors, radius, shadow, spacing } from '@kajianku/design-tokens'
import { authSchema, type Role } from '@kajianku/schemas'

export type Navigate = (href: string) => void

export function AppScreen({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
}) {
  const content = <View style={[styles.screenContent, padded && styles.padded]}>{children}</View>
  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  )
}

export function BrandHeader({
  title,
  subtitle,
  compact = false,
}: {
  title: string
  subtitle?: string
  compact?: boolean
}) {
  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <View style={styles.brandGlowLarge} />
      <View style={styles.brandGlowGold} />
      <View style={styles.brandMark}>
        <BookOpen color={colors.gold} size={compact ? 22 : 28} strokeWidth={2.4} />
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>KajianQu</Text>
      </View>
      <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </View>
  )
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  tone = 'primary',
}: {
  label: string
  onPress: () => void
  icon?: ReactNode
  disabled?: boolean
  tone?: 'primary' | 'secondary' | 'danger'
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' && styles.buttonSecondary,
        tone === 'danger' && styles.buttonDanger,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, tone === 'secondary' && styles.buttonSecondaryText]}>{label}</Text>
    </Pressable>
  )
}

export function SurfaceCard({
  children,
  onPress,
  style,
}: {
  children: ReactNode
  onPress?: () => void
  style?: object
}) {
  const body = <View style={[styles.card, style]}>{children}</View>
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.cardPressed}>
      {body}
    </Pressable>
  ) : (
    body
  )
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  )
}

const featureItems = [
  { title: "Al-Qur'an", icon: BookOpen, href: '/quran' },
  { title: 'AI Quran', icon: Bot, href: '/ai-quran' },
  { title: 'Materi', icon: GraduationCap, href: '/materi' },
  { title: 'Asatidz', icon: Users, href: '/asatidz-list' },
  { title: 'Kelas', icon: Video, href: '/kelas' },
  { title: 'Live', icon: Video, href: '/live' },
  { title: 'Chat', icon: MessageCircle, href: '/chat' },
  { title: "Do'a", icon: BookOpen, href: '/doa' },
  { title: 'Dzikir', icon: Sparkles, href: '/dzikir' },
  { title: 'Kiblat', icon: Compass, href: '/kiblat' },
  { title: 'Quote', icon: Quote, href: '/quote' },
  { title: 'Donasi', icon: HeartHandshake, href: '/donasi' },
]

export function HomeScreen({ role = 'siswa', navigate }: { role?: Role; navigate: Navigate }) {
  const { width } = useWindowDimensions()
  const columns = width >= 1100 ? 6 : width >= 700 ? 4 : width >= 450 ? 3 : 2
  const cardWidth = `${100 / columns - 2}%` as `${number}%`
  const materials = useQuery({ queryKey: ['home-materials'], queryFn: () => listPublishedMaterials(3) })
  const live = useQuery({ queryKey: ['home-live'], queryFn: listLiveEvents })
  const asatidz = useQuery({ queryKey: ['home-asatidz'], queryFn: listPublicAsatidz })
  const classes = useQuery({ queryKey: ['home-classes'], queryFn: listPrivateClasses })
  const nextLive = live.data?.find((item) => item.status === 'live') || live.data?.[0]
  return (
    <AppScreen padded={false}>
      <BrandHeader
        title={role === 'asatidz' ? 'Assalamu’alaikum, Ustadz' : role === 'admin' ? 'Pusat Kendali KajianQu' : 'Assalamu’alaikum'}
        subtitle="Belajar, bertumbuh, dan dekat dengan Al-Qur'an"
      />
      <View style={styles.bodySection}>
        <View style={[styles.homeIntro, width < 680 && styles.homeIntroCompact]}>
          <View style={styles.homeIntroCopy}>
            <Text style={styles.eyebrow}>SATU TEMPAT UNTUK BELAJAR</Text>
            <Text style={styles.homeIntroTitle}>Baca Al-Qur'an, ikuti kajian, dan bertanya kepada asatidz.</Text>
            <Text style={styles.homeIntroText}>Konten publik mengikuti status publish dan approval. Data pribadi tetap dilindungi sesuai peran akun.</Text>
            <View style={styles.homeActions}>
              <PrimaryButton label="Mulai baca Quran" onPress={() => navigate('/quran')} icon={<BookOpen color={colors.white} size={18} />} />
              <PrimaryButton label="Lihat materi" onPress={() => navigate('/materi')} tone="secondary" />
            </View>
          </View>
          <View style={styles.homeStats}>
            <View style={styles.homeStat}>
              <Text style={styles.homeStatValue}>{asatidz.data?.length ?? '–'}</Text>
              <Text style={styles.muted}>asatidz terverifikasi</Text>
            </View>
            <View style={styles.homeStat}>
              <Text style={styles.homeStatValue}>{classes.data?.length ?? '–'}</Text>
              <Text style={styles.muted}>kelas tersedia</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="Fitur utama" subtitle="Semua jalur tersambung ke halaman yang dapat digunakan" />
        <View style={styles.featureGrid}>
          {featureItems.map((item) => {
            const Icon = item.icon
            return (
              <Pressable
                key={item.href}
                onPress={() => navigate(item.href)}
                style={({ pressed }) => [styles.featureCard, { width: cardWidth }, pressed && styles.cardPressed]}
              >
                <View style={styles.featureIcon}>
                  <Icon color={colors.white} size={24} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <ChevronRight color={colors.primary} size={18} />
              </Pressable>
            )
          })}
        </View>

        {nextLive ? (
          <>
            <SectionTitle title={nextLive.status === 'live' ? 'Sedang live' : 'Jadwal kajian terdekat'} subtitle="Jadwal berasal dari data acara KajianQu" />
            <SurfaceCard onPress={() => navigate('/live')} style={styles.liveHighlight}>
            <View style={styles.rowGap}>
                <View style={styles.liveIcon}><Video color={colors.white} size={23} /></View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{nextLive.title}</Text>
                  <Text style={styles.muted}>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(nextLive.startsAt))}</Text>
                </View>
                <ChevronRight color={colors.primary} size={21} />
              </View>
            </SurfaceCard>
          </>
        ) : null}

        <SectionTitle title="Kajian pilihan" subtitle="Materi terbaru dari asatidz terverifikasi" />
        {materials.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {materials.isError ? <ErrorState message={materials.error.message} onRetry={() => void materials.refetch()} /> : null}
        {materials.data?.map((item) => (
          <SurfaceCard key={item.id} onPress={() => navigate(`/materi/${item.slug || item.id}`)}>
            <View style={styles.rowGap}>
              <View style={styles.videoThumb}>
                <Video color={colors.white} size={24} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.muted}>{item.summary || item.description || 'Materi KajianQu'}</Text>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </View>
          </SurfaceCard>
        ))}
        {!materials.isLoading && !materials.data?.length ? (
          <EmptyState title="Materi belum dipublikasikan" description="Materi akan tampil otomatis setelah disetujui dan dipublikasikan." />
        ) : null}
      </View>
    </AppScreen>
  )
}

export function QuranLibraryScreen({ navigate }: { navigate: Navigate }) {
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['surahs'], queryFn: listSurahs })
  const surahs = query.data || fallbackSurahs
  const filtered = surahs.filter((surah) =>
    `${surah.nameSimple} ${surah.nameArabic} ${surah.translatedName}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <AppScreen padded={false}>
      <BrandHeader title="Sahabat Qur'an" subtitle="Baca Al-Qur'an dengan tenang dan terarah" />
      <View style={styles.bodySection}>
        <View style={styles.searchField}>
          <Search color={colors.textMuted} size={20} />
          <TextInput
            accessibilityLabel="Cari surah"
            onChangeText={setSearch}
            placeholder="Cari surah atau nomor"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={search}
          />
        </View>
        {query.isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {filtered.map((surah) => (
          <SurfaceCard key={surah.id} onPress={() => navigate(`/quran/${surah.id}`)}>
            <View style={styles.rowGap}>
              <View style={styles.surahNumber}><Text style={styles.surahNumberText}>{surah.id}</Text></View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{surah.nameSimple}</Text>
                <Text style={styles.muted}>{surah.translatedName.toUpperCase()} • {surah.versesCount} AYAT</Text>
              </View>
              <View style={styles.alignEnd}>
                <Text style={styles.arabicSmall}>{surah.nameArabic}</Text>
                <Text style={styles.muted}>{surah.revelationPlace === 'makkah' ? 'Makkiyah' : 'Madaniyah'}</Text>
              </View>
            </View>
          </SurfaceCard>
        ))}
        {!query.isLoading && filtered.length === 0 ? <EmptyState title="Surah tidak ditemukan" /> : null}
      </View>
    </AppScreen>
  )
}

export function QuranReaderScreen({ surahNumber, navigate }: { surahNumber: number; navigate: Navigate }) {
  const query = useQuery({
    queryKey: ['surah-verses', surahNumber],
    queryFn: () => getSurahVerses(surahNumber),
  })
  const surah = fallbackSurahs.find((item) => item.id === surahNumber)
  return (
    <AppScreen padded={false}>
      <View style={styles.readerHeader}>
        <View>
          <Text style={styles.readerTitle}>{surah?.nameSimple || `Surah ${surahNumber}`}</Text>
          <Text style={styles.readerSubtitle}>{surah?.versesCount || '...'} ayat</Text>
        </View>
        <PrimaryButton label="Latihan AI" onPress={() => navigate(`/ai-quran/murojaah?surah=${surahNumber}`)} icon={<Mic color={colors.white} size={18} />} />
      </View>
      <View style={styles.bodySection}>
        {query.isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : null}
        {query.data?.map((verse) => (
          <View key={verse.id} style={styles.verseCard}>
            <View style={styles.verseNumber}><Text style={styles.verseNumberText}>{verse.number}</Text></View>
            <Text selectable style={styles.arabicVerse}>{verse.arabic}</Text>
            <Text style={styles.translation}>{verse.translation}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  )
}

export function AiQuranHubScreen({ navigate }: { navigate: Navigate }) {
  return (
    <AppScreen padded={false}>
      <BrandHeader title="AI Quran" subtitle="Pendamping latihan bacaan, bukan pengganti guru" />
      <View style={styles.bodySection}>
        <SurfaceCard onPress={() => navigate('/ai-quran/murojaah')} style={styles.aiModeCard}>
          <View style={styles.aiModeIcon}><RotateCcw color={colors.white} size={30} /></View>
          <View style={styles.flex}>
            <Text style={styles.aiModeTitle}>Murojaah</Text>
            <Text style={styles.muted}>Setorkan hafalan tanpa menampilkan ayat, lalu lihat bagian yang terlewat atau tertukar.</Text>
          </View>
          <ChevronRight color={colors.primary} size={24} />
        </SurfaceCard>
        <SurfaceCard onPress={() => navigate('/ai-quran/belajar')} style={styles.aiModeCard}>
          <View style={[styles.aiModeIcon, styles.aiModeIconGold]}><AudioLines color={colors.primaryDark} size={30} /></View>
          <View style={styles.flex}>
            <Text style={styles.aiModeTitle}>Belajar</Text>
            <Text style={styles.muted}>Baca sambil melihat ayat dan periksa kecocokan setiap kata setelah selesai.</Text>
          </View>
          <ChevronRight color={colors.primary} size={24} />
        </SurfaceCard>
        <View style={styles.notice}>
          <ShieldCheck color={colors.primary} size={22} />
          <Text style={styles.noticeText}>
            Hasil AI adalah bantuan latihan. Minta validasi asatidz untuk kesalahan tajwid atau hasil dengan confidence rendah.
          </Text>
        </View>
      </View>
    </AppScreen>
  )
}

export function AiPracticeScreen({ mode }: { mode: 'murojaah' | 'belajar' }) {
  const [surahNumber, setSurahNumber] = useState('1')
  const [ayahStart, setAyahStart] = useState('1')
  const [ayahEnd, setAyahEnd] = useState('2')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)
  const [result, setResult] = useState<QuranPracticeResult | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(recorder, 250)
  const parsedSurah = Number(surahNumber) || 1
  const parsedStart = Number(ayahStart) || 1
  const parsedEnd = Number(ayahEnd) || parsedStart
  const verses = useQuery({
    queryKey: ['practice-verses', parsedSurah],
    queryFn: () => getSurahVerses(parsedSurah),
  })

  useEffect(() => {
    let active = true
    void (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync()
      if (active && !permission.granted) setError('Izin mikrofon diperlukan untuk latihan bacaan.')
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    })()
    return () => {
      active = false
    }
  }, [])

  const expectedText = useMemo(
    () =>
      (verses.data || [])
        .filter((verse) => verse.number >= parsedStart && verse.number <= parsedEnd)
        .map((verse) => verse.arabic)
        .join(' '),
    [parsedEnd, parsedStart, verses.data],
  )

  async function toggleRecording() {
    setError(null)
    setSaveWarning(null)
    setResult(null)
    if (recorderState.isRecording) {
      const durationMillis = recorderState.durationMillis || 0
      await recorder.stop()
      if (!recorder.uri) {
        setError('Rekaman tidak ditemukan. Coba ulangi dan pastikan izin mikrofon aktif.')
        return
      }
      setProcessing(true)
      try {
        const transcription = await transcribeQuran({
          audioUri: recorder.uri,
          mode,
          surahNumber: parsedSurah,
          ayahStart: parsedStart,
          ayahEnd: parsedEnd,
        })
        const comparison = compareRecitation(expectedText, transcription.transcript)
        setConfidence(transcription.confidence)
        setResult(comparison)
        const surahName = fallbackSurahs.find((item) => item.id === parsedSurah)?.nameSimple || `Surah ${parsedSurah}`
        try {
          await saveQuranSession({
            mode,
            surahId: parsedSurah,
            surahName,
            ayahStart: parsedStart,
            ayahEnd: parsedEnd,
            totalWords: comparison.totalWords,
            correctWords: comparison.correctWords,
            accuracy: comparison.accuracy,
            mistakes: comparison.feedback.filter((word) => word.status !== 'correct'),
            durationSeconds: Math.max(1, Math.round(durationMillis / 1000)),
            transcript: transcription.transcript,
          })
        } catch {
          setSaveWarning('Hasil sudah tampil, tetapi riwayat belum tersimpan. Periksa koneksi lalu coba sesi berikutnya.')
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Bacaan belum berhasil diproses.')
      } finally {
        setProcessing(false)
      }
      return
    }
    if (parsedSurah < 1 || parsedSurah > 114 || parsedEnd < parsedStart) {
      setError('Periksa nomor surah serta rentang ayat.')
      return
    }
    await recorder.prepareToRecordAsync()
    recorder.record()
  }

  useEffect(() => {
    if (recorderState.isRecording && (recorderState.durationMillis || 0) >= 180_000 && !processing) {
      void toggleRecording()
    }
  }, [processing, recorderState.durationMillis, recorderState.isRecording])

  return (
    <AppScreen>
      <View style={styles.practiceHeading}>
        <View style={styles.sparkleIcon}><Sparkles color={colors.gold} size={24} /></View>
        <View style={styles.flex}>
          <Text style={styles.practiceTitle}>{mode === 'murojaah' ? 'Murojaah AI' : 'Belajar Bacaan'}</Text>
          <Text style={styles.muted}>{mode === 'murojaah' ? 'Ayat disembunyikan saat merekam' : 'Ayat ditampilkan sebagai panduan'}</Text>
        </View>
      </View>
      <View style={styles.formRow}>
        <LabeledInput label="Surah" value={surahNumber} onChangeText={setSurahNumber} />
        <LabeledInput label="Mulai" value={ayahStart} onChangeText={setAyahStart} />
        <LabeledInput label="Selesai" value={ayahEnd} onChangeText={setAyahEnd} />
      </View>
      {mode === 'belajar' ? (
        <SurfaceCard>
          {verses.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
          <Text selectable style={styles.practiceArabic}>{expectedText || 'Ayat belum tersedia'}</Text>
        </SurfaceCard>
      ) : (
        <View style={styles.hiddenVerse}>
          <BookOpen color={colors.primary} size={28} />
          <Text style={styles.hiddenVerseTitle}>Ayat disembunyikan</Text>
          <Text style={styles.muted}>Baca dari hafalan. Ayat akan muncul bersama hasil setelah rekaman selesai.</Text>
        </View>
      )}
      <View style={styles.recorderPanel}>
        <Text style={styles.timer}>
          {recorderState.isRecording ? formatDuration(recorderState.durationMillis || 0) : processing ? 'Memproses...' : 'Siap merekam'}
        </Text>
        <Pressable
          accessibilityLabel={recorderState.isRecording ? 'Hentikan rekaman' : 'Mulai merekam'}
          disabled={processing || verses.isLoading}
          onPress={() => void toggleRecording()}
          style={({ pressed }) => [
            styles.recordButton,
            recorderState.isRecording && styles.recordButtonActive,
            (pressed || processing) && styles.buttonPressed,
          ]}
        >
          {processing ? (
            <ActivityIndicator color={colors.white} />
          ) : recorderState.isRecording ? (
            <Square color={colors.white} fill={colors.white} size={28} />
          ) : (
            <Mic color={colors.white} size={32} />
          )}
        </Pressable>
        <Text style={styles.muted}>{recorderState.isRecording ? 'Tekan untuk selesai' : 'Rekam maksimal 3 menit per sesi'}</Text>
      </View>
      {error ? <ErrorState message={error} /> : null}
      {saveWarning ? (
        <View style={styles.warning}>
          <CircleAlert color={colors.warning} size={20} />
          <Text style={styles.warningText}>{saveWarning}</Text>
        </View>
      ) : null}
      {result ? <PracticeResult result={result} confidence={confidence} expectedText={expectedText} /> : null}
      {!isSupabaseConfigured() ? (
        <View style={styles.warning}>
          <CircleAlert color={colors.warning} size={20} />
          <Text style={styles.warningText}>Supabase belum dikonfigurasi. Pembaca Al-Quran tetap dapat dipakai, tetapi transkripsi AI memerlukan environment aplikasi.</Text>
        </View>
      ) : null}
    </AppScreen>
  )
}

function PracticeResult({ result, confidence, expectedText }: { result: QuranPracticeResult; confidence: number | null; expectedText: string }) {
  return (
    <View style={styles.resultSection}>
      <SectionTitle title="Hasil latihan" subtitle="Rincian kecocokan setiap kata" />
      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>{result.accuracy}%</Text>
        <Text style={styles.scoreLabel}>Kecocokan kata</Text>
        {confidence !== null ? <Text style={styles.muted}>Confidence transkripsi {Math.round(confidence * 100)}%</Text> : null}
      </View>
      <SurfaceCard>
        <Text style={styles.resultLabel}>Ayat acuan</Text>
        <Text selectable style={styles.resultArabic}>{expectedText}</Text>
        <Text style={styles.resultLabel}>Transkrip terdeteksi</Text>
        <Text selectable style={styles.resultArabic}>{result.normalizedTranscript || 'Tidak ada suara yang dikenali'}</Text>
      </SurfaceCard>
      {result.feedback.map((word, index) => (
        <View key={`${index}-${word.expected}-${word.spoken}`} style={styles.feedbackRow}>
          <View style={[
            styles.feedbackIcon,
            word.status === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}>
            {word.status === 'correct' ? <Check color={colors.success} size={18} /> : <X color={colors.danger} size={18} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.feedbackWord}>{word.expected || 'Kata tambahan'}</Text>
            <Text style={styles.muted}>
              {word.status === 'correct'
                ? 'Sesuai'
                : word.status === 'missing'
                  ? 'Tidak terbaca'
                  : word.status === 'extra'
                    ? `Tambahan: ${word.spoken}`
                    : `Terbaca: ${word.spoken}`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

function LabeledInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.formControl}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={onChangeText}
        style={styles.input}
        value={value}
      />
    </View>
  )
}

export function AuthScreen({ mode = 'login', navigate }: { mode?: 'login' | 'register'; navigate: Navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('siswa')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setMessage(null)
    const parsed = authSchema.safeParse({ email, password })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Periksa data Anda.')
      return
    }
    if (!isSupabaseConfigured()) {
      setMessage('Supabase belum dikonfigurasi. Isi environment aplikasi lebih dahulu.')
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const response =
        mode === 'login'
          ? await supabase.auth.signInWithPassword(parsed.data)
          : await supabase.auth.signUp({
              ...parsed.data,
              options: { data: { role, nama: email.split('@')[0] } },
            })
      if (response.error) throw response.error
      setMessage(mode === 'login' ? 'Berhasil masuk.' : 'Pendaftaran berhasil. Periksa email untuk verifikasi.')
      if (mode === 'login') navigate('/')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Autentikasi belum berhasil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppScreen>
      <View style={styles.authBrand}>
        <BookOpen color={colors.gold} size={54} />
        <Text style={styles.authLogo}>KajianQu</Text>
      </View>
      <Text style={styles.authTitle}>{mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}</Text>
      <Text style={styles.authSubtitle}>{mode === 'login' ? 'Lanjutkan perjalanan belajar Anda' : 'Pilih peran dan lengkapi data dasar'}</Text>
      {mode === 'register' ? (
        <View style={styles.roleSelector}>
          {(['siswa', 'asatidz'] as Role[]).map((item) => (
            <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleOption, role === item && styles.roleOptionActive]}>
              <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item === 'siswa' ? 'Siswa' : 'Asatidz'}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Text style={styles.inputLabel}>Alamat email</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        onChangeText={setEmail}
        placeholder="nama@email.com"
        placeholderTextColor={colors.textMuted}
        style={styles.textField}
        value={email}
      />
      <Text style={styles.inputLabel}>Kata sandi</Text>
      <TextInput
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        onChangeText={setPassword}
        placeholder="Minimal 8 karakter"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        style={styles.textField}
        value={password}
      />
      {message ? <Text style={styles.formMessage}>{message}</Text> : null}
      <PrimaryButton label={loading ? 'Mohon tunggu...' : mode === 'login' ? 'Masuk' : 'Daftar'} disabled={loading} onPress={() => void submit()} />
      <Pressable onPress={() => navigate(mode === 'login' ? '/register' : '/login')} style={styles.authSwitch}>
        <Text style={styles.muted}>
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Text style={styles.authLink}>{mode === 'login' ? 'Daftar sekarang' : 'Masuk'}</Text>
        </Text>
      </Pressable>
    </AppScreen>
  )
}

const roleModules: Record<Role, Array<{ title: string; subtitle: string; icon: typeof Users; href: string }>> = {
  admin: [
    { title: 'Asatidz', subtitle: 'Lihat direktori pengajar yang sudah terverifikasi', icon: ShieldCheck, href: '/asatidz-list' },
    { title: 'Materi', subtitle: 'Lihat materi yang sudah lolos review dan dipublikasikan', icon: Library, href: '/materi' },
    { title: 'Donasi', subtitle: 'Buka program dan alur transaksi donasi', icon: HeartHandshake, href: '/donasi' },
    { title: 'Moderasi', subtitle: 'Pantau ruang diskusi yang dapat dibaca publik', icon: MessageCircle, href: '/bahtsul-masail' },
  ],
  asatidz: [
    { title: 'Materi', subtitle: 'Buka katalog materi yang sudah dipublikasikan', icon: Library, href: '/materi' },
    { title: 'Kelas private', subtitle: 'Lihat jadwal dan status pendaftaran kelas', icon: GraduationCap, href: '/kelas' },
    { title: 'Chat siswa', subtitle: 'Buka pesan langsung dan grup kelas Anda', icon: MessageCircle, href: '/chat' },
    { title: 'Jadwal live', subtitle: 'Buka acara live KajianQu yang tersedia', icon: Video, href: '/live' },
  ],
  siswa: [
    { title: 'Materi belajar', subtitle: 'Pilih materi yang telah disetujui', icon: GraduationCap, href: '/materi' },
    { title: 'Kelas saya', subtitle: 'Daftar dan buka kelas yang tersedia', icon: Video, href: '/kelas' },
    { title: 'Latihan Quran', subtitle: 'Murojaah atau belajar dengan evaluasi kata', icon: BookOpen, href: '/ai-quran' },
    { title: 'Chat asatidz', subtitle: 'Tanya melalui ruang yang diizinkan', icon: MessageCircle, href: '/chat' },
  ],
}

export function RoleDashboardScreen({ role, navigate }: { role: Role; navigate: Navigate }) {
  const { width } = useWindowDimensions()
  const columns = width >= 1100 ? 4 : width >= 680 ? 2 : 1
  const itemWidth = `${100 / columns - (columns > 1 ? 1.5 : 0)}%` as `${number}%`
  return (
    <AppScreen padded={false}>
      <BrandHeader
        title={`Dashboard ${role === 'admin' ? 'Admin' : role === 'asatidz' ? 'Asatidz' : 'Siswa'}`}
        subtitle="Ringkasan aktivitas dan pekerjaan penting"
      />
      <View style={styles.bodySection}>
        <SectionTitle title="Menu kerja" subtitle="Akses modul sesuai permission akun Anda" />
        <View style={styles.dashboardGrid}>
          {roleModules[role].map((module) => {
            const Icon = module.icon
            return (
              <Pressable key={module.title} onPress={() => navigate(module.href)} style={[styles.dashboardModule, { width: itemWidth }]}>
                <View style={styles.softIcon}><Icon color={colors.primary} size={24} /></View>
                <Text style={styles.cardTitle}>{module.title}</Text>
                <Text style={styles.muted}>{module.subtitle}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </AppScreen>
  )
}

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.softIcon}><Library color={colors.primary} size={26} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.muted}>{description}</Text> : null}
    </View>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorState}>
      <CircleAlert color={colors.danger} size={22} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <PrimaryButton label="Coba lagi" onPress={onRetry} tone="secondary" /> : null}
    </View>
  )
}

function formatDuration(value: number) {
  const seconds = Math.floor(value / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  screenContent: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  padded: { padding: spacing.lg },
  brandHeader: { backgroundColor: colors.primaryDark, paddingHorizontal: spacing.xl, paddingTop: 52, paddingBottom: 34, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, overflow: 'hidden' },
  brandHeaderCompact: { paddingTop: 24, paddingBottom: 20 },
  brandGlowLarge: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.primary, opacity: 0.55, right: -75, top: -90 },
  brandGlowGold: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: colors.gold, opacity: 0.09, left: -55, bottom: -95 },
  brandMark: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  brandName: { color: colors.white, fontWeight: '800', fontSize: 20 },
  brandNameCompact: { fontSize: 17 },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  heroTitleCompact: { fontSize: 22 },
  heroSubtitle: { color: '#DDF3EA', fontSize: 15, marginTop: spacing.sm, lineHeight: 22 },
  bodySection: { padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 1240, alignSelf: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.sm, ...shadow.card },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  button: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  buttonSecondary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonPressed: { opacity: 0.55 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  buttonSecondaryText: { color: colors.primary },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { color: colors.textMuted, marginTop: 2, lineHeight: 20 },
  homeIntro: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, flexDirection: 'row', alignItems: 'stretch', gap: spacing.xl, ...shadow.card },
  homeIntroCompact: { flexDirection: 'column' },
  homeIntroCopy: { flex: 1, justifyContent: 'center' },
  homeIntroTitle: { color: colors.primaryDark, fontSize: 27, lineHeight: 36, fontWeight: '900', marginTop: spacing.sm, maxWidth: 720 },
  homeIntroText: { color: colors.textMuted, fontSize: 15, lineHeight: 24, marginTop: spacing.sm, maxWidth: 720 },
  homeActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  homeStats: { minWidth: 220, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  homeStat: { borderBottomWidth: 1, borderBottomColor: '#C8E1D8', paddingBottom: spacing.sm },
  homeStatValue: { color: colors.primaryDark, fontSize: 27, fontWeight: '900' },
  liveHighlight: { borderColor: '#A7D7C6', backgroundColor: '#F6FCF9' },
  liveIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  prayerCard: { backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  prayerTime: { color: colors.primaryDark, fontSize: 25, fontWeight: '800', marginVertical: 4 },
  prayerBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  prayerBadgeText: { color: colors.white, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  featureCard: { minWidth: 150, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, minHeight: 132, justifyContent: 'space-between', ...shadow.card },
  featureIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 15, color: colors.text, fontWeight: '800' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  softIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 21 },
  progressValue: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  progressTrack: { height: 7, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  videoThumb: { width: 74, height: 52, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchField: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 50 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, outlineStyle: 'none' } as object,
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 4 },
  segmentActive: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  segmentItem: { flex: 1, padding: spacing.md, alignItems: 'center' },
  segmentActiveText: { color: colors.primary, fontWeight: '800' },
  segmentText: { color: colors.textMuted, fontWeight: '700' },
  loader: { padding: spacing.xl },
  surahNumber: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  surahNumberText: { color: colors.primary, fontWeight: '800' },
  alignEnd: { alignItems: 'flex-end' },
  arabicSmall: { color: colors.primary, fontSize: 21, lineHeight: 30 },
  readerHeader: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  readerTitle: { color: colors.white, fontSize: 23, fontWeight: '800' },
  readerSubtitle: { color: '#DDF3EA', marginTop: 4 },
  verseCard: { paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  verseNumber: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  verseNumberText: { color: colors.primary, fontWeight: '800' },
  arabicVerse: { color: colors.text, fontSize: 30, lineHeight: 54, textAlign: 'right', writingDirection: 'rtl' },
  translation: { color: colors.textMuted, fontSize: 14, lineHeight: 23, marginTop: spacing.md },
  aiModeCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, minHeight: 150 },
  aiModeIcon: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  aiModeIconGold: { backgroundColor: colors.goldSoft },
  aiModeTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  notice: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg },
  noticeText: { flex: 1, color: colors.primaryDark, lineHeight: 21 },
  practiceHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  sparkleIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  practiceTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  formRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  formControl: { flex: 1 },
  inputLabel: { color: colors.text, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, minHeight: 46, color: colors.text, outlineStyle: 'none' } as object,
  practiceArabic: { color: colors.text, fontSize: 27, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' },
  hiddenVerse: { minHeight: 170, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  hiddenVerseTitle: { color: colors.primaryDark, fontSize: 17, fontWeight: '800' },
  recorderPanel: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  timer: { color: colors.text, fontSize: 21, fontWeight: '800' },
  recordButton: { width: 82, height: 82, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  recordButtonActive: { backgroundColor: colors.danger },
  warning: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.warningSoft, padding: spacing.md, borderRadius: radius.md },
  warningText: { flex: 1, color: colors.warning, lineHeight: 20 },
  resultSection: { gap: spacing.sm },
  scoreCard: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl },
  scoreValue: { color: colors.white, fontSize: 46, fontWeight: '900' },
  scoreLabel: { color: colors.white, fontWeight: '800', marginBottom: 6 },
  resultLabel: { color: colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: spacing.sm },
  resultArabic: { color: colors.text, fontSize: 21, lineHeight: 36, textAlign: 'right', writingDirection: 'rtl' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  feedbackIcon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  feedbackCorrect: { backgroundColor: colors.successSoft },
  feedbackWrong: { backgroundColor: colors.dangerSoft },
  feedbackWord: { color: colors.text, fontSize: 18, fontWeight: '700', writingDirection: 'rtl' },
  authBrand: { alignItems: 'center', marginTop: 40, marginBottom: spacing.xl },
  authLogo: { color: colors.primaryDark, fontSize: 34, fontWeight: '900', marginTop: 6 },
  authTitle: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  authSubtitle: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
  textField: { minHeight: 52, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.lg, color: colors.text, outlineStyle: 'none' } as object,
  formMessage: { color: colors.danger, marginBottom: spacing.md, lineHeight: 20 },
  authSwitch: { alignItems: 'center', padding: spacing.lg },
  authLink: { color: colors.primary, fontWeight: '800' },
  roleSelector: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 4, marginBottom: spacing.xl },
  roleOption: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.sm },
  roleOptionActive: { backgroundColor: colors.primary },
  roleText: { color: colors.textMuted, fontWeight: '800' },
  roleTextActive: { color: colors.white },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { flex: 1, minWidth: 170 },
  metricValue: { color: colors.primaryDark, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  dashboardModule: { minWidth: 250, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm, ...shadow.card },
  emptyState: { minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  errorState: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md, alignItems: 'flex-start' },
  errorText: { color: colors.danger, lineHeight: 20 },
})

export * from './features'
