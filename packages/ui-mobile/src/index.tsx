import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
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
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  GraduationCap,
  HeartHandshake,
  Library,
  MessageCircle,
  Mic,
  Play,
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
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { useQuery } from '@tanstack/react-query'
import {
  getSupabase,
  getCurrentProfile,
  getSurahVerses,
  isSupabaseConfigured,
  listLiveEvents,
  listPublishedMaterials,
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
  { title: 'Keilmuan', icon: GraduationCap, href: '/materi' },
  { title: "Do'a", icon: BookOpen, href: '/doa' },
  { title: 'Kiblat', icon: Compass, href: '/kiblat' },
  { title: 'Donasi', icon: HeartHandshake, href: '/donasi' },
  { title: 'AI Quran', icon: Bot, href: '/ai-quran' },
]

export function HomeScreen({ role = 'siswa', navigate }: { role?: Role; navigate: Navigate }) {
  const profile = useQuery({ queryKey: ['current-profile'], queryFn: getCurrentProfile })
  const materials = useQuery({ queryKey: ['home-materials'], queryFn: () => listPublishedMaterials(3) })
  const live = useQuery({ queryKey: ['home-live'], queryFn: listLiveEvents })
  const nextLive = live.data?.find((item) => item.status === 'live') || live.data?.[0]
  const displayName = profile.data?.nama || (role === 'admin' ? 'Admin KajianQu' : 'Sahabat KajianQu')
  return (
    <AppScreen padded={false}>
      <View style={styles.prayerHero}>
        <View style={styles.prayerOrnamentOne} />
        <View style={styles.prayerOrnamentTwo} />
        <View style={styles.homeTopbar}>
          <View style={styles.homeLogo}>
            <BookOpen color={colors.gold} size={27} strokeWidth={2.2} />
            <Text style={styles.homeLogoText}>KajianQu</Text>
          </View>
          <Pressable accessibilityLabel="Buka notifikasi" onPress={() => navigate('/notifications')} style={styles.notificationButton}>
            <Bell color={colors.white} fill={colors.white} size={21} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
        <View style={styles.currentPrayer}>
          <Text style={styles.currentPrayerName}>Dzuhur</Text>
          <Text style={styles.currentPrayerTime}>10:30 WIB</Text>
          <Text style={styles.currentPrayerCountdown}>-01:30:06 menjelang adzan</Text>
        </View>
        <View style={styles.prayerSchedule}>
          {[
            ['Subuh', '04:37'],
            ['Dzuhur', '11:54'],
            ['Ashar', '15:14'],
            ['Maghrib', '18:10'],
            ['Isya', '19:02'],
          ].map(([name, time]) => (
            <View key={name} style={styles.prayerScheduleItem}>
              <Text style={styles.prayerScheduleName}>{name}</Text>
              <Text style={styles.prayerScheduleTime}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.homeSheet}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingLabel}>Assalamu'alaikum</Text>
            <Text style={styles.greetingName}>{displayName}</Text>
          </View>
          <View style={styles.greetingBadge}><Text style={styles.greetingBadgeText}>Sambutan</Text></View>
        </View>

        <SectionTitle title="Fitur Utama" />
        <View style={styles.featureGrid}>
          {featureItems.map((item) => {
            const Icon = item.icon
            return (
              <Pressable
                key={item.href}
                onPress={() => navigate(item.href)}
                style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
              >
                <View style={styles.featureIcon}>
                  <Icon color={colors.white} size={22} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
              </Pressable>
            )
          })}
        </View>

        <SectionTitle
          title="Jadwal Live"
          subtitle="Kajian terdekat hari ini"
          action={<Pressable onPress={() => navigate('/live')} style={styles.seeAllButton}><Text style={styles.seeAllText}>Lihat Semua</Text></Pressable>}
        />
        {nextLive ? (
          <SurfaceCard onPress={() => navigate('/live')} style={styles.liveScheduleCard}>
            <View style={styles.liveScheduleRow}>
              <View style={styles.liveTimeBox}>
                <Clock3 color={colors.primary} size={17} />
                <Text style={styles.liveTimeText}>{new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(nextLive.startsAt))}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{nextLive.title}</Text>
                <Text style={styles.muted}>{nextLive.status === 'live' ? 'Sedang berlangsung' : 'Terjadwal'}</Text>
              </View>
              <View style={styles.liveJoinButton}><Text style={styles.liveJoinText}>Mulai</Text></View>
            </View>
          </SurfaceCard>
        ) : (
          <SurfaceCard style={styles.liveScheduleCard}>
            <View style={styles.liveScheduleRow}>
              <View style={styles.liveTimeBox}><Video color={colors.primary} size={20} /></View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Belum ada live hari ini</Text>
                <Text style={styles.muted}>Jadwal baru akan muncul otomatis.</Text>
              </View>
            </View>
          </SurfaceCard>
        )}

        <SectionTitle
          title="Materi Pilihan"
          subtitle="Belajar bersama asatidz terverifikasi"
          action={<Pressable onPress={() => navigate('/materi')} style={styles.seeAllButton}><Text style={styles.seeAllText}>Lihat Semua</Text></Pressable>}
        />
        {materials.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {materials.isError ? <ErrorState message={materials.error.message} onRetry={() => void materials.refetch()} /> : null}
        {materials.data?.map((item) => (
          <SurfaceCard key={item.id} onPress={() => navigate(`/materi/${item.slug || item.id}`)} style={styles.materialRowCard}>
            <View style={styles.rowGap}>
              {item.thumbnailUrl ? (
                <Image resizeMode="cover" source={{ uri: item.thumbnailUrl }} style={styles.videoThumbImage} />
              ) : (
                <View style={styles.videoThumb}>
                  <Play color={colors.white} fill={colors.white} size={19} />
                </View>
              )}
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.muted}>{item.summary || item.description || 'Materi KajianQu'}</Text>
              </View>
              <ChevronRight color={colors.textMuted} size={19} />
            </View>
          </SurfaceCard>
        ))}
        {!materials.isLoading && !materials.data?.length ? (
          <EmptyState title="Materi belum dipublikasikan" description="Materi akan tampil otomatis setelah disetujui." />
        ) : null}

        <Pressable onPress={() => navigate('/ai-quran')} style={styles.aiCta}>
          <View style={styles.aiCtaIcon}><Mic color={colors.white} size={27} /></View>
          <View style={styles.flex}>
            <Text style={styles.aiCtaTitle}>Cek Tajwid dengan AI</Text>
            <Text style={styles.aiCtaText}>Latih murojaah dan pelajari bacaan dengan umpan balik terperinci.</Text>
          </View>
          <ChevronRight color={colors.white} size={23} />
        </Pressable>
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

function VerseAudioButton({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri)
  return (
    <Pressable
      accessibilityLabel="Putar audio ayat"
      onPress={() => {
        void player.seekTo(0)
        player.play()
      }}
      style={({ pressed }) => [styles.verseAudioButton, pressed && styles.buttonPressed]}
    >
      <Play color={colors.primary} fill={colors.primary} size={16} />
      <Text style={styles.verseAudioText}>Dengarkan</Text>
    </Pressable>
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
            <View style={styles.readerVerseTop}>
              <View style={styles.verseNumber}><Text style={styles.verseNumberText}>{verse.number}</Text></View>
              {verse.audioUrl ? <VerseAudioButton uri={verse.audioUrl} /> : null}
            </View>
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

export function AuthScreen({
  mode = 'login',
  initialRole = 'siswa',
  navigate,
}: {
  mode?: 'login' | 'register'
  initialRole?: Extract<Role, 'siswa' | 'asatidz'>
  navigate: Navigate
}) {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(initialRole)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setMessage(null)
    const parsed = authSchema.safeParse({ email, password })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Periksa data Anda.')
      return
    }
    if (mode === 'register' && name.trim().length < 3) {
      setMessage('Nama lengkap minimal 3 karakter.')
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
              options: { data: { role, nama: name.trim(), no_wa: whatsapp.trim() || null } },
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
    <AppScreen padded={false}>
      <View style={styles.authPage}>
        <View style={styles.authBrand}>
          <View style={styles.authLogoMark}>
            <BookOpen color={colors.gold} size={56} strokeWidth={2.4} />
          </View>
          <Text style={styles.authLogo}>KajianQu</Text>
          <Text style={styles.authTagline}>Elevating Islamic Education</Text>
        </View>
        <View style={styles.authPanel}>
          <Text style={styles.authTitle}>{mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}</Text>
          <Text style={styles.authSubtitle}>{mode === 'login' ? 'Lanjutkan perjalanan belajar bersama KajianQu' : 'Pilih peran dan lengkapi data dasar'}</Text>
          {mode === 'register' ? (
            <>
              <View style={styles.roleSelector}>
                {(['siswa', 'asatidz'] as Role[]).map((item) => (
                  <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleOption, role === item && styles.roleOptionActive]}>
                    <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item === 'siswa' ? 'Santri' : 'Asatidz'}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Nama sesuai identitas"
                placeholderTextColor="#93A09A"
                style={styles.textField}
                value={name}
              />
              <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
              <TextInput
                autoComplete="tel"
                keyboardType="phone-pad"
                onChangeText={setWhatsapp}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#93A09A"
                style={styles.textField}
                value={whatsapp}
              />
            </>
          ) : null}
          <Text style={styles.inputLabel}>Alamat Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            inputMode="email"
            onChangeText={setEmail}
            placeholder="nama@email.com"
            placeholderTextColor="#93A09A"
            style={styles.textField}
            value={email}
          />
          <View style={styles.passwordLabelRow}>
            <Text style={styles.inputLabel}>Kata Sandi</Text>
            {mode === 'login' ? (
              <Pressable onPress={() => navigate('/forgot-password')}>
                <Text style={styles.forgotPassword}>Lupa kata sandi?</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChangeText={setPassword}
            placeholder="Minimal 8 karakter"
            placeholderTextColor="#93A09A"
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
        </View>
        <View style={styles.authFooter}>
          <Text style={styles.authFooterBrand}>KajianQu</Text>
          <Text style={styles.authFooterText}>© 2026 KajianQu. Elevating Islamic Education.</Text>
          <Text style={styles.authFooterLinks}>Kebijakan Privasi   •   Syarat Layanan   •   Bantuan</Text>
        </View>
      </View>
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
    { title: 'Kelola materi', subtitle: 'Upload materi dan pantau status review admin', icon: Library, href: '/asatidz/materials' },
    { title: 'Kelas private', subtitle: 'Lihat jadwal dan status pendaftaran kelas', icon: GraduationCap, href: '/kelas' },
    { title: 'Chat siswa', subtitle: 'Buka pesan langsung dan grup kelas Anda', icon: MessageCircle, href: '/chat' },
    { title: 'Buat jadwal live', subtitle: 'Atur jadwal dan tautan siaran kajian', icon: Video, href: '/asatidz/live/new' },
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
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  screenContent: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  padded: { padding: spacing.lg },
  brandHeader: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: 36, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
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
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: '#E5ECE9', padding: spacing.lg, marginBottom: spacing.sm, ...shadow.card },
  cardPressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  button: { minHeight: 54, borderRadius: 28, backgroundColor: colors.primary, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  buttonSecondary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonPressed: { opacity: 0.55 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  buttonSecondaryText: { color: colors.primary },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: 22, marginBottom: spacing.sm },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { color: '#111A17', fontSize: 18, fontWeight: '900' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 18 },
  homeIntro: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, flexDirection: 'row', alignItems: 'stretch', gap: spacing.xl, ...shadow.card },
  homeIntroCompact: { flexDirection: 'column' },
  homeIntroCopy: { flex: 1, justifyContent: 'center' },
  homeIntroTitle: { color: colors.primaryDark, fontSize: 27, lineHeight: 36, fontWeight: '900', marginTop: spacing.sm, maxWidth: 720 },
  homeIntroText: { color: colors.textMuted, fontSize: 15, lineHeight: 24, marginTop: spacing.sm, maxWidth: 720 },
  homeActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  homeStats: { minWidth: 220, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  homeStat: { borderBottomWidth: 1, borderBottomColor: '#C8E1D8', paddingBottom: spacing.sm },
  homeStatValue: { color: colors.primaryDark, fontSize: 27, fontWeight: '900' },
  prayerHero: { minHeight: 342, backgroundColor: colors.primary, paddingHorizontal: 26, paddingTop: 54, paddingBottom: 20, overflow: 'hidden' },
  prayerOrnamentOne: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)', left: -120, top: 105 },
  prayerOrnamentTwo: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: colors.primaryDark, opacity: 0.14, right: -95, bottom: -120 },
  homeTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeLogo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  homeLogoText: { color: colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  notificationButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', right: 8, top: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: '#F44455', borderWidth: 1.5, borderColor: colors.white },
  currentPrayer: { alignItems: 'center', marginTop: 39 },
  currentPrayerName: { color: '#E4F5EF', fontSize: 15, fontWeight: '600' },
  currentPrayerTime: { color: colors.white, fontSize: 32, lineHeight: 42, fontWeight: '900', letterSpacing: -0.8 },
  currentPrayerCountdown: { color: '#E4F5EF', fontSize: 13 },
  prayerSchedule: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 36 },
  prayerScheduleItem: { alignItems: 'center', minWidth: 54 },
  prayerScheduleName: { color: colors.white, fontSize: 13, fontWeight: '800' },
  prayerScheduleTime: { color: '#DDF2EA', fontSize: 13, marginTop: 4 },
  homeSheet: { marginTop: -2, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 26, paddingTop: 25, paddingBottom: 40 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  greetingLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  greetingName: { color: '#111A17', fontSize: 17, fontWeight: '900' },
  greetingBadge: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 15, paddingVertical: 7 },
  greetingBadgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  seeAllButton: { backgroundColor: colors.primarySoft, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  seeAllText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  liveScheduleCard: { padding: 13, borderColor: colors.primary, shadowOpacity: 0, elevation: 0 },
  liveScheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveTimeBox: { minWidth: 54, alignItems: 'center', gap: 3 },
  liveTimeText: { color: colors.textMuted, fontSize: 10 },
  liveJoinButton: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 9 },
  liveJoinText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  materialRowCard: { padding: 0, borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  aiCta: { marginTop: 26, minHeight: 124, borderRadius: 16, padding: 17, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 13, overflow: 'hidden' },
  aiCtaIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  aiCtaTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginBottom: 5 },
  aiCtaText: { color: '#E2F3ED', fontSize: 12, lineHeight: 18 },
  liveHighlight: { borderColor: '#A7D7C6', backgroundColor: '#F6FCF9' },
  liveIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  prayerCard: { backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
  prayerTime: { color: colors.primaryDark, fontSize: 25, fontWeight: '800', marginVertical: 4 },
  prayerBadge: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  prayerBadgeText: { color: colors.white, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  featureGrid: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  featureCard: { flex: 1, minWidth: 45, alignItems: 'center', gap: 6 },
  featureIcon: { width: 48, height: 48, borderRadius: 6, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 9, lineHeight: 12, textAlign: 'center', color: colors.primaryDark, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  softIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 21 },
  progressValue: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  progressTrack: { height: 7, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  videoThumb: { width: 88, height: 60, borderRadius: 8, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  videoThumbImage: { width: 88, height: 60, borderRadius: 8, backgroundColor: colors.surfaceMuted },
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
  readerVerseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  verseAudioButton: { minHeight: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 6 },
  verseAudioText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
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
  authPage: { minHeight: 820, backgroundColor: '#ECF8F1', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 34 },
  authBrand: { alignItems: 'center', marginBottom: 30 },
  authLogoMark: { height: 62, alignItems: 'center', justifyContent: 'center' },
  authLogo: { color: colors.primaryDark, fontSize: 34, fontWeight: '900', marginTop: 2, letterSpacing: -1 },
  authTagline: { color: '#42514B', fontSize: 14, marginTop: 5 },
  authPanel: { width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: colors.white, borderRadius: 36, paddingHorizontal: 32, paddingTop: 34, paddingBottom: 24, ...shadow.card },
  authTitle: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  authSubtitle: { color: colors.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.xl },
  passwordLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forgotPassword: { color: '#936B00', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  textField: { minHeight: 56, backgroundColor: '#F1F5F2', borderWidth: 1, borderColor: '#E2EAE6', borderRadius: 28, paddingHorizontal: 20, marginBottom: spacing.lg, color: colors.text, outlineStyle: 'none' } as object,
  formMessage: { color: colors.danger, marginBottom: spacing.md, lineHeight: 20 },
  authSwitch: { alignItems: 'center', padding: spacing.lg },
  authLink: { color: colors.primary, fontWeight: '800' },
  authFooter: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingTop: 35, gap: 10 },
  authFooterBrand: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  authFooterText: { color: colors.textMuted, fontSize: 12 },
  authFooterLinks: { color: colors.textMuted, fontSize: 11, lineHeight: 20 },
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
export * from './figma-screens'
