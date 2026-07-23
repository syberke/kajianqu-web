import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  Library,
  LogOut,
  MapPin,
  MessageCircle,
  Play,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  WalletCards,
} from 'lucide-react-native'
import {
  createDonationTransaction,
  ensureClassChat,
  ensureDirectChat,
  getCurrentProfile,
  joinPrivateClass,
  listAchievements,
  listChatMessages,
  listChatRooms,
  listDailyPrayers,
  listDhikr,
  listDiscussionTopics,
  listDonationPrograms,
  listLiveEvents,
  listNotifications,
  listPrivateClasses,
  listPublicAsatidz,
  listPublishedMaterials,
  listQuranHistory,
  listQuotes,
  markNotificationRead,
  sendChatMessage,
  signOut,
  subscribeToChatRoom,
} from '@kajianku/api-client'
import { colors, radius, shadow, spacing } from '@kajianku/design-tokens'

export type FeatureNavigate = (href: string) => void

function Page({
  children,
  title,
  subtitle,
  icon,
}: {
  children: ReactNode
  title: string
  subtitle: string
  icon: ReactNode
}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={featureStyles.page}
      contentContainerStyle={featureStyles.pageContent}
    >
      <View style={featureStyles.hero}>
        <View style={featureStyles.heroGlowOne} />
        <View style={featureStyles.heroGlowTwo} />
        <View style={featureStyles.heroIcon}>{icon}</View>
        <Text style={featureStyles.heroTitle}>{title}</Text>
        <Text style={featureStyles.heroSubtitle}>{subtitle}</Text>
      </View>
      <View style={featureStyles.container}>{children}</View>
    </ScrollView>
  )
}

function Card({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: object }) {
  const content = <View style={[featureStyles.card, style]}>{children}</View>
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && featureStyles.pressed}>
      {content}
    </Pressable>
  ) : content
}

function ActionButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
  icon,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: 'primary' | 'soft'
  icon?: ReactNode
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        featureStyles.action,
        tone === 'soft' && featureStyles.actionSoft,
        (pressed || disabled) && featureStyles.pressed,
      ]}
    >
      {icon}
      <Text style={[featureStyles.actionText, tone === 'soft' && featureStyles.actionTextSoft]}>{label}</Text>
    </Pressable>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={featureStyles.sectionHeading}>
      <Text style={featureStyles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={featureStyles.muted}>{subtitle}</Text> : null}
    </View>
  )
}

function QueryState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean
  error?: Error | null
  empty: boolean
  onRetry?: () => void
}) {
  if (loading) {
    return (
      <View style={featureStyles.state}>
        <ActivityIndicator color={colors.primary} />
        <Text style={featureStyles.muted}>Memuat data...</Text>
      </View>
    )
  }
  if (error) {
    return (
      <View style={[featureStyles.state, featureStyles.errorState]}>
        <CircleAlert color={colors.danger} size={24} />
        <Text style={featureStyles.errorText}>{error.message}</Text>
        {onRetry ? <ActionButton label="Coba lagi" onPress={onRetry} tone="soft" /> : null}
      </View>
    )
  }
  if (empty) {
    return (
      <View style={featureStyles.state}>
        <Library color={colors.primary} size={30} />
        <Text style={featureStyles.stateTitle}>Belum ada data yang dipublikasikan</Text>
        <Text style={featureStyles.muted}>Konten akan tampil otomatis setelah tersedia di Supabase.</Text>
      </View>
    )
  }
  return null
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <View style={featureStyles.search}>
      <Search color={colors.textMuted} size={19} />
      <TextInput
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={featureStyles.searchInput}
        value={value}
      />
    </View>
  )
}

function formatDate(value: string | null) {
  if (!value) return 'Jadwal menyusul'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export function MaterialCatalogScreen({ navigate }: { navigate: FeatureNavigate }) {
  const { width } = useWindowDimensions()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Semua')
  const query = useQuery({ queryKey: ['published-materials'], queryFn: () => listPublishedMaterials(48) })
  const items = (query.data || []).filter((item) => {
    const matchesSearch = `${item.title} ${item.summary || ''} ${item.level || ''}`.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = level === 'Semua' || (item.level || '').toLowerCase() === level.toLowerCase()
    return matchesSearch && matchesLevel
  })
  const itemWidth = width >= 1080 ? '31.8%' : '48%'
  return (
    <Page title="Keilmuan" subtitle="Materi terpilih dari asatidz yang telah melalui proses review" icon={<GraduationCap color={colors.gold} size={28} />}>
      <SearchField value={search} onChange={setSearch} placeholder="Cari judul, topik, atau tingkat materi" />
      <View style={featureStyles.pillRow}>
        {['Semua', 'Pemula', 'Menengah', 'Lanjutan'].map((label) => (
          <Pressable key={label} onPress={() => setLevel(label)} style={[featureStyles.pill, level === label && featureStyles.pillActive]}>
            <Text style={[featureStyles.pillText, level === label && featureStyles.pillActiveText]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} onRetry={() => void query.refetch()} />
      <View style={featureStyles.grid}>
        {items.map((item) => (
          <Card key={item.id} style={{ width: itemWidth }}>
            {item.thumbnailUrl ? (
              <Image resizeMode="cover" source={{ uri: item.thumbnailUrl }} style={featureStyles.mediaImage} />
            ) : (
              <View style={featureStyles.mediaPlaceholder}>
                <Play color={colors.white} fill={colors.white} size={26} />
              </View>
            )}
            <View style={featureStyles.badge}><Text style={featureStyles.badgeText}>{item.level || 'Umum'}</Text></View>
            <Text style={featureStyles.cardTitle}>{item.title}</Text>
            <Text numberOfLines={3} style={featureStyles.muted}>{item.summary || item.description || 'Materi kajian terverifikasi.'}</Text>
            <ActionButton label="Lihat materi" onPress={() => navigate(`/materi/${item.slug || item.id}`)} tone="soft" />
          </Card>
        ))}
      </View>
    </Page>
  )
}

export function MaterialDetailScreen({ identifier, navigate }: { identifier: string; navigate: FeatureNavigate }) {
  const query = useQuery({ queryKey: ['published-materials'], queryFn: () => listPublishedMaterials(100) })
  const material = query.data?.find((item) => item.slug === identifier || item.id === identifier)
  const canOpenVideo = Boolean(material?.youtubeUrl && /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(material.youtubeUrl))
  return (
    <Page title="Detail Materi" subtitle="Materi yang sudah dipublikasikan dan lolos proses review" icon={<BookOpen color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !material} onRetry={() => void query.refetch()} />
      {material ? (
        <Card>
          <View style={featureStyles.badge}><Text style={featureStyles.badgeText}>{material.level || 'Umum'}</Text></View>
          <Text style={featureStyles.detailTitle}>{material.title}</Text>
          {material.summary ? <Text style={featureStyles.detailLead}>{material.summary}</Text> : null}
          {material.description ? <Text style={featureStyles.detailBody}>{material.description}</Text> : null}
          <View style={featureStyles.buttonRow}>
            {canOpenVideo && material.youtubeUrl ? (
              <ActionButton
                label="Tonton materi"
                onPress={() => void Linking.openURL(material.youtubeUrl!)}
                icon={<Play color={colors.white} size={17} />}
              />
            ) : null}
            <ActionButton label="Kembali ke materi" onPress={() => navigate('/materi')} tone="soft" />
          </View>
        </Card>
      ) : null}
    </Page>
  )
}

export function AsatidzDirectoryScreen({ navigate }: { navigate: FeatureNavigate }) {
  const { width } = useWindowDimensions()
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['public-asatidz'], queryFn: listPublicAsatidz })
  const items = (query.data || []).filter((item) =>
    `${item.nama} ${item.title || ''} ${item.bidang || ''}`.toLowerCase().includes(search.toLowerCase()),
  )
  const itemWidth = width >= 1080 ? '31.8%' : width >= 720 ? '48.5%' : '100%'
  return (
    <Page title="Daftar Asatidz" subtitle="Belajar bersama pengajar yang sudah disetujui KajianQu" icon={<Users color={colors.gold} size={28} />}>
      <SearchField value={search} onChange={setSearch} placeholder="Cari nama atau bidang keilmuan" />
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} onRetry={() => void query.refetch()} />
      <View style={featureStyles.grid}>
        {items.map((item) => (
          <Card key={item.id} style={{ width: itemWidth }}>
            {item.fotoUrl ? (
              <Image accessibilityLabel={`Foto ${item.nama}`} source={{ uri: item.fotoUrl }} style={featureStyles.avatarImage} />
            ) : (
              <View style={featureStyles.avatar}><Text style={featureStyles.avatarText}>{item.nama.slice(0, 2).toUpperCase()}</Text></View>
            )}
            <View style={featureStyles.verifiedRow}>
              <CheckCircle2 color={colors.primary} size={17} />
              <Text style={featureStyles.verifiedText}>Asatidz terverifikasi</Text>
            </View>
            <Text style={featureStyles.cardTitle}>{[item.title, item.nama].filter(Boolean).join(' ')}</Text>
            <Text style={featureStyles.accentText}>{item.bidang || 'Keilmuan Islam'}</Text>
            <Text numberOfLines={3} style={featureStyles.muted}>{item.bio || 'Profil pengajar KajianQu.'}</Text>
            {item.teachingArea ? (
              <View style={featureStyles.metaRow}><MapPin color={colors.textMuted} size={16} /><Text style={featureStyles.muted}>{item.teachingArea}</Text></View>
            ) : null}
            <ActionButton label="Lihat profil dan kelas" onPress={() => navigate(`/asatidz/${item.id}`)} tone="soft" />
          </Card>
        ))}
      </View>
    </Page>
  )
}

export function AsatidzDetailScreen({ id, navigate }: { id: string; navigate: FeatureNavigate }) {
  const profileQuery = useQuery({ queryKey: ['public-asatidz'], queryFn: listPublicAsatidz })
  const classQuery = useQuery({ queryKey: ['private-classes'], queryFn: listPrivateClasses })
  const profile = profileQuery.data?.find((item) => item.id === id)
  const classes = (classQuery.data || []).filter((item) => item.asatidzId === id)
  const [chatBusy, setChatBusy] = useState(false)
  const [chatMessage, setChatMessage] = useState<string | null>(null)

  async function openDirectChat() {
    setChatBusy(true)
    setChatMessage(null)
    try {
      const roomId = await ensureDirectChat(id)
      navigate(`/chat/${roomId}`)
    } catch (caught) {
      setChatMessage(caught instanceof Error ? caught.message : 'Chat dengan asatidz belum dapat dibuka.')
    } finally {
      setChatBusy(false)
    }
  }

  return (
    <Page title="Profil Asatidz" subtitle="Informasi publik dan kelas yang sedang tersedia" icon={<Users color={colors.gold} size={28} />}>
      <QueryState loading={profileQuery.isLoading} error={profileQuery.error} empty={!profileQuery.isLoading && !profile} onRetry={() => void profileQuery.refetch()} />
      {profile ? (
        <Card>
          <View style={featureStyles.profileHeader}>
            {profile.fotoUrl ? (
              <Image accessibilityLabel={`Foto ${profile.nama}`} source={{ uri: profile.fotoUrl }} style={featureStyles.avatarImage} />
            ) : (
              <View style={featureStyles.avatar}><Text style={featureStyles.avatarText}>{profile.nama.slice(0, 2).toUpperCase()}</Text></View>
            )}
            <View style={featureStyles.flex}>
              <View style={featureStyles.verifiedRow}>
                <CheckCircle2 color={colors.primary} size={17} />
                <Text style={featureStyles.verifiedText}>Asatidz terverifikasi</Text>
              </View>
              <Text style={featureStyles.detailTitle}>{[profile.title, profile.nama].filter(Boolean).join(' ')}</Text>
              <Text style={featureStyles.accentText}>{profile.bidang || 'Keilmuan Islam'}</Text>
            </View>
          </View>
          {profile.bio ? <Text style={featureStyles.detailBody}>{profile.bio}</Text> : null}
          {profile.teachingArea ? (
            <View style={featureStyles.metaRow}><MapPin color={colors.primary} size={17} /><Text style={featureStyles.muted}>{profile.teachingArea}</Text></View>
          ) : null}
          {profile.memorizationJuz ? (
            <View style={featureStyles.metaRow}><BookMarked color={colors.primary} size={17} /><Text style={featureStyles.muted}>Hafalan {profile.memorizationJuz} juz</Text></View>
          ) : null}
          {chatMessage ? <Text style={featureStyles.formMessage}>{chatMessage}</Text> : null}
          <ActionButton
            label={chatBusy ? 'Membuka chat...' : 'Mulai chat dengan asatidz'}
            disabled={chatBusy}
            onPress={() => void openDirectChat()}
            icon={<MessageCircle color={colors.white} size={18} />}
          />
        </Card>
      ) : null}
      {profile ? <SectionHeading title="Kelas tersedia" subtitle="Pendaftaran dan chat mengikuti status keanggotaan kelas" /> : null}
      <QueryState loading={classQuery.isLoading} error={classQuery.error} empty={Boolean(profile && !classQuery.isLoading && classes.length === 0)} onRetry={() => void classQuery.refetch()} />
      {classes.map((item) => (
        <Card key={item.id}>
          <Text style={featureStyles.cardTitle}>{item.title}</Text>
          <Text style={featureStyles.muted}>{item.description || 'Kelas bersama asatidz KajianQu.'}</Text>
          <View style={featureStyles.metaRow}><CalendarDays color={colors.primary} size={16} /><Text style={featureStyles.muted}>{formatDate(item.startsAt)}</Text></View>
          <ActionButton label="Lihat detail kelas" onPress={() => navigate(`/kelas/${item.id}`)} tone="soft" />
        </Card>
      ))}
    </Page>
  )
}

export function PrivateClassesScreen({ navigate }: { navigate: FeatureNavigate }) {
  const { width } = useWindowDimensions()
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const query = useQuery({ queryKey: ['private-classes'], queryFn: listPrivateClasses })
  const itemWidth = width >= 1000 ? '48.6%' : '100%'

  async function join(classId: string) {
    setBusyId(classId)
    setNotice(null)
    try {
      await joinPrivateClass(classId)
      setNotice('Permintaan bergabung berhasil dikirim. Statusnya dapat dilihat pada profil Anda.')
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Pendaftaran kelas belum berhasil.')
    } finally {
      setBusyId(null)
    }
  }

  async function openChat(classId: string) {
    setBusyId(classId)
    setNotice(null)
    try {
      const roomId = await ensureClassChat(classId)
      navigate(`/chat/${roomId}`)
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Chat kelas belum dapat dibuka.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Page title="Kelas Kajian" subtitle="Kelas terarah, jadwal jelas, dan akses chat berdasarkan keanggotaan" icon={<Video color={colors.gold} size={28} />}>
      {notice ? <View style={featureStyles.notice}><CircleAlert color={colors.primary} size={20} /><Text style={featureStyles.noticeText}>{notice}</Text></View> : null}
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      <View style={featureStyles.grid}>
        {(query.data || []).map((item) => (
          <Card key={item.id} style={{ width: itemWidth }}>
            <View style={featureStyles.classHeader}>
              <View style={featureStyles.classIcon}><BookMarked color={colors.white} size={25} /></View>
              <View style={featureStyles.flex}>
                <Text style={featureStyles.cardTitle}>{item.title}</Text>
                <Text style={featureStyles.accentText}>{item.price > 0 ? formatCurrency(item.price) : 'Gratis'}</Text>
              </View>
            </View>
            <Text style={featureStyles.muted}>{item.description || 'Kelas private bersama asatidz KajianQu.'}</Text>
            <View style={featureStyles.metaGrid}>
              <View style={featureStyles.metaRow}><CalendarDays color={colors.primary} size={16} /><Text style={featureStyles.muted}>{formatDate(item.startsAt)}</Text></View>
              <View style={featureStyles.metaRow}><Users color={colors.primary} size={16} /><Text style={featureStyles.muted}>Kapasitas {item.capacity}</Text></View>
            </View>
            <View style={featureStyles.buttonRow}>
              <ActionButton label={busyId === item.id ? 'Memproses...' : 'Daftar'} disabled={busyId === item.id} onPress={() => void join(item.id)} />
              <ActionButton label="Detail kelas" disabled={busyId === item.id} onPress={() => navigate(`/kelas/${item.id}`)} tone="soft" />
              <ActionButton label="Chat kelas" disabled={busyId === item.id} onPress={() => void openChat(item.id)} tone="soft" />
            </View>
          </Card>
        ))}
      </View>
    </Page>
  )
}

export function LiveEventsScreen() {
  const query = useQuery({ queryKey: ['live-events'], queryFn: listLiveEvents })
  return (
    <Page title="Jadwal Live" subtitle="Kajian live publik dari sumber yang telah divalidasi" icon={<Video color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item) => (
        <Card key={item.id}>
          {item.thumbnailUrl ? <Image resizeMode="cover" source={{ uri: item.thumbnailUrl }} style={featureStyles.liveImage} /> : null}
          <View style={featureStyles.liveRow}>
            <View style={[featureStyles.liveStatus, item.status === 'live' && featureStyles.liveStatusActive]}>
              <Text style={featureStyles.liveStatusText}>{item.status === 'live' ? 'LIVE' : 'TERJADWAL'}</Text>
            </View>
            <Text style={featureStyles.provider}>{item.provider.toUpperCase()}</Text>
          </View>
          <Text style={featureStyles.cardTitle}>{item.title}</Text>
          <Text style={featureStyles.muted}>{item.description || 'Kajian live KajianQu.'}</Text>
          <View style={featureStyles.metaRow}><Clock3 color={colors.primary} size={17} /><Text style={featureStyles.muted}>{formatDate(item.startsAt)}</Text></View>
          <ActionButton
            label={item.status === 'live' ? 'Tonton sekarang' : 'Buka halaman acara'}
            onPress={() => void Linking.openURL(item.eventUrl)}
            icon={<Play color={colors.white} size={17} />}
          />
        </Card>
      ))}
    </Page>
  )
}

export function DonationProgramsScreen() {
  const query = useQuery({ queryKey: ['donation-programs'], queryFn: listDonationPrograms })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [amount, setAmount] = useState('50000')
  const [payment, setPayment] = useState<'bank_transfer' | 'qris' | 'ewallet'>('bank_transfer')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    if (!selectedId) {
      setMessage('Pilih program donasi terlebih dahulu.')
      return
    }
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount < 10_000) {
      setMessage('Nominal donasi minimum Rp10.000.')
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const result = await createDonationTransaction({
        programId: selectedId,
        amount: numericAmount,
        paymentMethod: payment,
        idempotencyKey: `donation-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
      })
      setMessage(`Transaksi ${String(result?.transaction_code || '')} berhasil dibuat dan menunggu pembayaran.`)
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Transaksi belum berhasil dibuat.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title="Donasi KajianQu" subtitle="Wakaf Al-Qur'an, infaq asatidz, dan program sosial yang diverifikasi" icon={<HeartHandshake color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      <View style={featureStyles.grid}>
        {(query.data || []).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedId(item.id)}
            style={[featureStyles.programCard, selectedId === item.id && featureStyles.programCardSelected]}
          >
            <View style={featureStyles.donationIcon}><HeartHandshake color={colors.primary} size={24} /></View>
            <Text style={featureStyles.cardTitle}>{item.title}</Text>
            <Text style={featureStyles.accentText}>{item.category.replaceAll('_', ' ')}</Text>
            <Text style={featureStyles.muted}>{item.description}</Text>
          </Pressable>
        ))}
      </View>
      {query.data?.length ? (
        <Card>
          <SectionHeading title="Buat transaksi donasi" subtitle="Minimum Rp10.000. Bukti pembayaran tetap diperiksa admin." />
          <Text style={featureStyles.label}>Nominal</Text>
          <TextInput keyboardType="number-pad" onChangeText={setAmount} style={featureStyles.input} value={amount} />
          <Text style={featureStyles.label}>Metode pembayaran</Text>
          <View style={featureStyles.pillRow}>
            {([
              ['bank_transfer', 'Transfer Bank'],
              ['qris', 'QRIS'],
              ['ewallet', 'E-Wallet'],
            ] as const).map(([value, label]) => (
              <Pressable key={value} onPress={() => setPayment(value)} style={[featureStyles.pill, payment === value && featureStyles.pillActive]}>
                <Text style={[featureStyles.pillText, payment === value && featureStyles.pillActiveText]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {message ? <Text style={featureStyles.formMessage}>{message}</Text> : null}
          <ActionButton label={busy ? 'Memproses...' : 'Lanjutkan donasi'} disabled={busy} onPress={() => void submit()} icon={<CreditCard color={colors.white} size={18} />} />
        </Card>
      ) : null}
    </Page>
  )
}

export function PrayerLibraryScreen({ mode }: { mode: 'prayer' | 'dhikr' }) {
  const query = useQuery({
    queryKey: [mode === 'prayer' ? 'daily-prayers' : 'dhikr'],
    queryFn: mode === 'prayer' ? listDailyPrayers : listDhikr,
  })
  return (
    <Page
      title={mode === 'prayer' ? "Do'a Harian" : 'Dzikir'}
      subtitle={mode === 'prayer' ? 'Bacaan, arti, fadhilah, dan rujukan dalam satu tempat' : 'Dzikir pagi, petang, dan umum'}
      icon={<BookOpen color={colors.gold} size={28} />}
    >
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item) => (
        <Card key={item.id}>
          <Text style={featureStyles.cardTitle}>{item.title}</Text>
          {'period' in item && 'repetitions' in item ? (
            <View style={featureStyles.badge}><Text style={featureStyles.badgeText}>{String(item.period)} • {String(item.repetitions)}x</Text></View>
          ) : null}
          <Text selectable style={featureStyles.arabic}>{item.arabicText}</Text>
          {item.transliteration ? <Text style={featureStyles.transliteration}>{item.transliteration}</Text> : null}
          <Text style={featureStyles.translation}>{item.translation}</Text>
          {item.reference ? <Text style={featureStyles.reference}>Sumber: {item.reference}</Text> : null}
        </Card>
      ))}
    </Page>
  )
}

export function QuotesScreen() {
  const query = useQuery({ queryKey: ['quotes'], queryFn: listQuotes })
  return (
    <Page title="Quote Harian" subtitle="Pengingat singkat yang telah melalui moderasi konten" icon={<Quote color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item) => (
        <Card key={item.id} style={featureStyles.quoteCard}>
          <Quote color={colors.gold} size={30} />
          <Text style={featureStyles.quoteText}>{item.content}</Text>
          <Text style={featureStyles.accentText}>{item.source || 'KajianQu'}</Text>
        </Card>
      ))}
    </Page>
  )
}

export function DiscussionScreen({ kind }: { kind: 'bahtsul' | 'muamalat' }) {
  const query = useQuery({ queryKey: ['discussion', kind], queryFn: () => listDiscussionTopics(kind) })
  return (
    <Page
      title={kind === 'bahtsul' ? 'Bahtsul Masail' : 'Muamalat'}
      subtitle={kind === 'bahtsul' ? 'Diskusi persoalan keislaman dengan penanda jawaban resmi' : 'Pembahasan transaksi dan kehidupan sosial'}
      icon={<MessageCircle color={colors.gold} size={28} />}
    >
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item) => (
        <Card key={item.id}>
          <View style={featureStyles.discussionTop}>
            <View style={featureStyles.badge}><Text style={featureStyles.badgeText}>{item.category || 'Umum'}</Text></View>
            <Text style={featureStyles.statusText}>{item.status}</Text>
          </View>
          <Text style={featureStyles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={4} style={featureStyles.muted}>{item.content}</Text>
        </Card>
      ))}
    </Page>
  )
}

export function ChatRoomsScreen({ navigate }: { navigate: FeatureNavigate }) {
  const query = useQuery({ queryKey: ['chat-rooms'], queryFn: listChatRooms })
  return (
    <Page title="Pesan" subtitle="Chat pribadi dan grup kelas yang terlindungi oleh keanggotaan" icon={<MessageCircle color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((room) => (
        <Card key={room.id} onPress={() => navigate(`/chat/${room.id}`)}>
          <View style={featureStyles.roomRow}>
            <View style={featureStyles.roomIcon}>{room.roomType === 'class' ? <Users color={colors.white} size={21} /> : <MessageCircle color={colors.white} size={21} />}</View>
            <View style={featureStyles.flex}>
              <Text style={featureStyles.cardTitle}>{room.title}</Text>
              <Text style={featureStyles.muted}>{room.roomType === 'class' ? 'Grup kelas' : 'Pesan pribadi'} • {formatDate(room.updatedAt)}</Text>
            </View>
            <ChevronRight color={colors.textMuted} size={21} />
          </View>
        </Card>
      ))}
    </Page>
  )
}

export function ChatRoomScreen({ roomId }: { roomId: string }) {
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: ['current-profile'], queryFn: getCurrentProfile })
  const messages = useQuery({ queryKey: ['chat-messages', roomId], queryFn: () => listChatMessages(roomId) })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const channel = subscribeToChatRoom(roomId, () => {
      void queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] })
      void queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    })
    if (!channel) return
    return () => {
      void channel.unsubscribe()
    }
  }, [queryClient, roomId])

  async function send() {
    setBusy(true)
    setError(null)
    try {
      await sendChatMessage(roomId, message)
      setMessage('')
      await queryClient.invalidateQueries({ queryKey: ['chat-messages', roomId] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pesan belum terkirim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title="Ruang Chat" subtitle="Pesan tersimpan dan hanya dapat dibaca anggota room" icon={<MessageCircle color={colors.gold} size={28} />}>
      <QueryState loading={messages.isLoading} error={messages.error} empty={!messages.isLoading && !messages.data?.length} onRetry={() => void messages.refetch()} />
      <View style={featureStyles.messageList}>
        {(messages.data || []).map((item) => {
          const own = item.senderId === profile.data?.id
          return (
            <View key={item.id} style={[featureStyles.messageBubble, own && featureStyles.messageBubbleOwn]}>
              {item.isPinned ? <Text style={featureStyles.pinned}>Pesan disematkan</Text> : null}
              <Text style={[featureStyles.messageText, own && featureStyles.messageTextOwn]}>{item.content}</Text>
              <Text style={[featureStyles.messageTime, own && featureStyles.messageTimeOwn]}>{formatDate(item.createdAt)}</Text>
            </View>
          )
        })}
      </View>
      {error ? <Text style={featureStyles.errorText}>{error}</Text> : null}
      <View style={featureStyles.composer}>
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder="Tulis pesan..."
          placeholderTextColor={colors.textMuted}
          style={featureStyles.composerInput}
          value={message}
        />
        <Pressable disabled={busy || !message.trim()} onPress={() => void send()} style={({ pressed }) => [featureStyles.sendButton, (pressed || busy || !message.trim()) && featureStyles.pressed]}>
          {busy ? <ActivityIndicator color={colors.white} /> : <Send color={colors.white} size={21} />}
        </Pressable>
      </View>
    </Page>
  )
}

export function ProfileScreen({ navigate }: { navigate: FeatureNavigate }) {
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: ['current-profile'], queryFn: getCurrentProfile })

  if (!profile.isLoading && !profile.data) {
    return (
      <Page title="Profil" subtitle="Kelola akun dan perjalanan belajar Anda" icon={<Users color={colors.gold} size={28} />}>
        <Card>
          <Text style={featureStyles.cardTitle}>Anda belum masuk</Text>
          <Text style={featureStyles.muted}>Masuk untuk mengelola profil, kelas, chat, riwayat Quran, dan achievement.</Text>
          <ActionButton label="Masuk atau daftar" onPress={() => navigate('/login')} />
        </Card>
      </Page>
    )
  }

  async function logout() {
    await signOut()
    await queryClient.invalidateQueries()
    navigate('/')
  }

  return (
    <Page title="Profil Saya" subtitle="Kelola akun dan perjalanan belajar di KajianQu" icon={<Users color={colors.gold} size={28} />}>
      {profile.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <Card style={featureStyles.profileHeroCard}>
        <View style={featureStyles.profileHeader}>
          {profile.data?.fotoUrl ? (
            <Image accessibilityLabel={`Foto ${profile.data.nama}`} source={{ uri: profile.data.fotoUrl }} style={featureStyles.profileAvatarImage} />
          ) : (
            <View style={featureStyles.profileAvatar}><Text style={featureStyles.profileAvatarText}>{(profile.data?.nama || 'KQ').slice(0, 2).toUpperCase()}</Text></View>
          )}
          <View style={featureStyles.flex}>
            <Text style={featureStyles.cardTitle}>{profile.data?.nama}</Text>
            <Text style={featureStyles.accentText}>{profile.data?.role === 'siswa' ? 'Santri KajianQu' : profile.data?.role === 'asatidz' ? 'Asatidz KajianQu' : 'Administrator'}</Text>
            <Text numberOfLines={1} style={featureStyles.muted}>{profile.data?.email}</Text>
          </View>
        </View>
        <ActionButton label="Edit profil" onPress={() => navigate('/profile/edit')} tone="soft" />
      </Card>
      <View style={featureStyles.profileStats}>
        <View style={featureStyles.profileStat}><Text style={featureStyles.profileStatValue}>Quran</Text><Text style={featureStyles.muted}>Riwayat latihan</Text></View>
        <View style={featureStyles.profileStat}><Text style={featureStyles.profileStatValue}>Kelas</Text><Text style={featureStyles.muted}>Belajar terarah</Text></View>
        <View style={featureStyles.profileStat}><Text style={featureStyles.profileStatValue}>Chat</Text><Text style={featureStyles.muted}>Tanya asatidz</Text></View>
      </View>
      <View style={featureStyles.grid}>
        <Card onPress={() => navigate('/quran/riwayat')} style={featureStyles.profileMenu}>
          <BookOpen color={colors.primary} size={22} /><View style={featureStyles.flex}><Text style={featureStyles.cardTitle}>Riwayat Quran</Text><Text style={featureStyles.muted}>Lihat hasil murojaah dan belajar</Text></View><ChevronRight color={colors.textMuted} size={20} />
        </Card>
        <Card onPress={() => navigate('/achievement')} style={featureStyles.profileMenu}>
          <Award color={colors.primary} size={22} /><View style={featureStyles.flex}><Text style={featureStyles.cardTitle}>Achievement</Text><Text style={featureStyles.muted}>Pantau pencapaian belajar</Text></View><ChevronRight color={colors.textMuted} size={20} />
        </Card>
        <Card onPress={() => navigate('/profile/change-password')} style={featureStyles.profileMenu}>
          <ShieldCheck color={colors.primary} size={22} /><View style={featureStyles.flex}><Text style={featureStyles.cardTitle}>Keamanan akun</Text><Text style={featureStyles.muted}>Ubah kata sandi akun</Text></View><ChevronRight color={colors.textMuted} size={20} />
        </Card>
        {profile.data?.role === 'asatidz' ? (
          <Card onPress={() => navigate('/asatidz/materials')} style={featureStyles.profileMenu}>
            <Library color={colors.primary} size={22} /><View style={featureStyles.flex}><Text style={featureStyles.cardTitle}>Kelola konten</Text><Text style={featureStyles.muted}>Materi dan jadwal live</Text></View><ChevronRight color={colors.textMuted} size={20} />
          </Card>
        ) : null}
        <Card onPress={() => navigate('/notifications')} style={featureStyles.profileMenu}>
          <Bell color={colors.primary} size={22} /><View style={featureStyles.flex}><Text style={featureStyles.cardTitle}>Notifikasi</Text><Text style={featureStyles.muted}>Pembaruan kelas dan aktivitas</Text></View><ChevronRight color={colors.textMuted} size={20} />
        </Card>
      </View>
      <ActionButton label="Keluar dari akun" onPress={() => void logout()} tone="soft" icon={<LogOut color={colors.primary} size={18} />} />
    </Page>
  )
}

export function QuranHistoryScreen() {
  const query = useQuery({ queryKey: ['quran-history'], queryFn: listQuranHistory })
  return (
    <Page title="Riwayat Quran" subtitle="Sesi murojaah dan belajar yang berhasil disimpan" icon={<BookOpen color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item: Record<string, unknown>) => (
        <Card key={String(item.id)}>
          <View style={featureStyles.historyRow}>
            <View style={featureStyles.scoreBubble}><Text style={featureStyles.scoreBubbleText}>{Math.round(Number(item.accuracy || 0))}%</Text></View>
            <View style={featureStyles.flex}>
              <Text style={featureStyles.cardTitle}>{String(item.surah_name || `Surah ${item.surah_id}`)}</Text>
              <Text style={featureStyles.muted}>{String(item.mode)} • Ayat {String(item.ayah_start)}-{String(item.ayah_end)}</Text>
              <Text style={featureStyles.muted}>{formatDate(String(item.created_at))}</Text>
            </View>
          </View>
        </Card>
      ))}
    </Page>
  )
}

export function AchievementsScreen() {
  const query = useQuery({ queryKey: ['achievements'], queryFn: listAchievements })
  return (
    <Page title="Achievement" subtitle="Milestone diberikan berdasarkan progres nyata" icon={<Award color={colors.gold} size={28} />}>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      <View style={featureStyles.grid}>
        {(query.data || []).map((item) => (
          <Card key={item.id} style={featureStyles.achievementCard}>
            <View style={featureStyles.achievementIcon}><Award color={colors.gold} size={26} /></View>
            <Text style={featureStyles.cardTitle}>{item.title}</Text>
            <Text style={featureStyles.muted}>{item.description}</Text>
            {item.targetRole ? <Text style={featureStyles.accentText}>Untuk {item.targetRole}</Text> : null}
          </Card>
        ))}
      </View>
    </Page>
  )
}

function qiblaBearing(latitude: number, longitude: number) {
  const kaabaLatitude = 21.4225 * Math.PI / 180
  const kaabaLongitude = 39.8262 * Math.PI / 180
  const currentLatitude = latitude * Math.PI / 180
  const currentLongitude = longitude * Math.PI / 180
  const deltaLongitude = kaabaLongitude - currentLongitude
  const y = Math.sin(deltaLongitude)
  const x = Math.cos(currentLatitude) * Math.tan(kaabaLatitude) -
    Math.sin(currentLatitude) * Math.cos(deltaLongitude)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function QiblaScreen() {
  const [latitude, setLatitude] = useState('-7.9666')
  const [longitude, setLongitude] = useState('112.6326')
  const bearing = useMemo(() => qiblaBearing(Number(latitude) || 0, Number(longitude) || 0), [latitude, longitude])
  return (
    <Page title="Arah Kiblat" subtitle="Perkiraan arah berdasarkan koordinat, tetap kalibrasi kompas perangkat" icon={<Compass color={colors.gold} size={28} />}>
      <Card style={featureStyles.qiblaCard}>
        <View style={[featureStyles.compassRing, { transform: [{ rotate: `${bearing}deg` }] }]}>
          <View style={featureStyles.compassNeedle} />
          <Text style={featureStyles.compassNorth}>K</Text>
        </View>
        <Text style={featureStyles.qiblaValue}>{Math.round(bearing)}°</Text>
        <Text style={featureStyles.muted}>dari arah utara searah jarum jam</Text>
      </Card>
      <Card>
        <Text style={featureStyles.label}>Latitude</Text>
        <TextInput keyboardType="numbers-and-punctuation" onChangeText={setLatitude} style={featureStyles.input} value={latitude} />
        <Text style={featureStyles.label}>Longitude</Text>
        <TextInput keyboardType="numbers-and-punctuation" onChangeText={setLongitude} style={featureStyles.input} value={longitude} />
        <View style={featureStyles.notice}>
          <Compass color={colors.primary} size={20} />
          <Text style={featureStyles.noticeText}>Akurasi bergantung pada koordinat, sensor, medan magnet, dan kalibrasi perangkat. Jauhkan perangkat dari benda logam.</Text>
        </View>
      </Card>
    </Page>
  )
}

export function NotificationsScreen({ navigate }: { navigate: FeatureNavigate }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: listNotifications })

  async function openNotification(id: string, actionUrl: string | null) {
    try {
      await markNotificationRead(id)
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } finally {
      if (actionUrl?.startsWith('/')) navigate(actionUrl)
      else if (actionUrl && /^https:\/\//i.test(actionUrl)) void Linking.openURL(actionUrl)
    }
  }

  return (
    <Page
      title="Notifikasi"
      subtitle="Pembaruan kelas, kajian live, materi, dan aktivitas akun"
      icon={<Bell color={colors.gold} size={28} />}
    >
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && !query.data?.length} onRetry={() => void query.refetch()} />
      {(query.data || []).map((item) => (
        <Card key={item.id} onPress={() => void openNotification(item.id, item.actionUrl)} style={!item.isRead ? featureStyles.unreadCard : undefined}>
          <View style={featureStyles.roomRow}>
            <View style={[featureStyles.roomIcon, item.isRead && featureStyles.roomIconRead]}><Bell color={colors.white} size={20} /></View>
            <View style={featureStyles.flex}>
              <View style={featureStyles.notificationTitleRow}>
                <Text style={featureStyles.cardTitle}>{item.title}</Text>
                {!item.isRead ? <View style={featureStyles.unreadDot} /> : null}
              </View>
              <Text style={featureStyles.muted}>{item.message}</Text>
              <Text style={featureStyles.notificationTime}>{formatDate(item.createdAt)}</Text>
            </View>
            {item.actionUrl ? <ChevronRight color={colors.textMuted} size={20} /> : null}
          </View>
        </Card>
      ))}
    </Page>
  )
}

export function NotFoundScreen({ navigate }: { navigate: FeatureNavigate }) {
  return (
    <Page title="Halaman tidak ditemukan" subtitle="Tautan yang Anda buka tidak tersedia di KajianQu" icon={<CircleAlert color={colors.gold} size={28} />}>
      <Card>
        <Text style={featureStyles.cardTitle}>Mari kembali ke halaman utama</Text>
        <Text style={featureStyles.muted}>Periksa kembali alamat halaman atau gunakan navigasi utama untuk menemukan fitur yang dicari.</Text>
        <ActionButton label="Kembali ke beranda" onPress={() => navigate('/')} />
      </Card>
    </Page>
  )
}

const featureStyles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.background },
  pageContent: { flexGrow: 1 },
  hero: { minHeight: 166, backgroundColor: colors.primary, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24, overflow: 'hidden', justifyContent: 'flex-end' },
  heroGlowOne: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.primaryDark, opacity: 0.18, right: -95, top: -95 },
  heroGlowTwo: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)', left: -80, bottom: -90 },
  heroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  heroTitle: { color: colors.white, fontSize: 23, fontWeight: '900', letterSpacing: -0.4 },
  heroSubtitle: { color: '#D9EEE7', fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 720 },
  container: { width: '100%', maxWidth: 1220, alignSelf: 'center', marginTop: -2, backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 40, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: '#E3EBE8', padding: spacing.lg, gap: spacing.md, ...shadow.card },
  pressed: { opacity: 0.58 },
  action: { minHeight: 48, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  actionSoft: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#BDE2D5' },
  actionText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  actionTextSoft: { color: colors.primaryDark },
  sectionHeading: { gap: 3, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  state: { minHeight: 230, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  errorState: { backgroundColor: colors.dangerSoft },
  stateTitle: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  errorText: { color: colors.danger, lineHeight: 21 },
  search: { minHeight: 52, backgroundColor: colors.surface, borderRadius: 26, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, ...shadow.card },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, outlineStyle: 'none' } as object,
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { minHeight: 38, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  pillActiveText: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  mediaPlaceholder: { height: 132, borderRadius: 10, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  mediaImage: { width: '100%', height: 132, borderRadius: 10, backgroundColor: colors.surfaceMuted },
  badge: { alignSelf: 'flex-start', borderRadius: 5, backgroundColor: colors.gold, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  badgeText: { color: '#2B2400', fontWeight: '900', fontSize: 10, textTransform: 'uppercase' },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '900', lineHeight: 21 },
  detailTitle: { color: colors.text, fontSize: 28, fontWeight: '900', lineHeight: 36 },
  detailLead: { color: colors.primaryDark, fontSize: 18, fontWeight: '700', lineHeight: 29 },
  detailBody: { color: colors.text, fontSize: 16, lineHeight: 28 },
  accentText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surfaceMuted },
  avatarText: { color: colors.white, fontSize: 21, fontWeight: '900' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  classHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  classIcon: { width: 54, height: 54, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  metaGrid: { gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  liveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveImage: { width: '100%', height: 160, borderRadius: 12, backgroundColor: colors.surfaceMuted },
  liveStatus: { borderRadius: radius.pill, backgroundColor: colors.goldSoft, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  liveStatusActive: { backgroundColor: colors.dangerSoft },
  liveStatusText: { color: colors.danger, fontSize: 11, fontWeight: '900' },
  provider: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  programCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm, ...shadow.card },
  programCardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  donationIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.text, fontSize: 12, fontWeight: '900', marginTop: spacing.sm },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.md, outlineStyle: 'none' } as object,
  formMessage: { color: colors.primaryDark, lineHeight: 21 },
  notice: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'flex-start' },
  noticeText: { flex: 1, color: colors.primaryDark, lineHeight: 21 },
  arabic: { color: colors.text, fontSize: 31, lineHeight: 55, textAlign: 'right', writingDirection: 'rtl' },
  transliteration: { color: colors.primaryDark, fontSize: 14, lineHeight: 23, fontStyle: 'italic' },
  translation: { color: colors.text, fontSize: 14, lineHeight: 23 },
  reference: { color: colors.textMuted, fontSize: 12, lineHeight: 19, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  quoteCard: { minHeight: 210, justifyContent: 'center', backgroundColor: colors.primarySoft },
  quoteText: { color: colors.primaryDark, fontSize: 21, lineHeight: 32, fontWeight: '800' },
  discussionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusText: { color: colors.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roomIcon: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  messageList: { gap: spacing.sm },
  messageBubble: { alignSelf: 'flex-start', maxWidth: '84%', backgroundColor: colors.surface, borderRadius: radius.lg, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  messageBubbleOwn: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderColor: colors.primary, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: 4 },
  messageText: { color: colors.text, lineHeight: 21 },
  messageTextOwn: { color: colors.white },
  messageTime: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  messageTimeOwn: { color: '#D9EEE7' },
  pinned: { color: colors.gold, fontSize: 10, fontWeight: '900', marginBottom: 4 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  composerInput: { flex: 1, minHeight: 46, maxHeight: 130, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, color: colors.text, outlineStyle: 'none' } as object,
  sendButton: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  profileHeroCard: { backgroundColor: '#F7FCF9', borderColor: '#CBE6DC' },
  profileAvatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, borderWidth: 4, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  profileAvatarImage: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.surfaceMuted, borderWidth: 4, borderColor: colors.white },
  profileAvatarText: { color: colors.white, fontSize: 22, fontWeight: '900' },
  profileStats: { flexDirection: 'row', gap: 8 },
  profileStat: { flex: 1, minHeight: 78, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 11, justifyContent: 'center', ...shadow.card },
  profileStatValue: { color: colors.primaryDark, fontSize: 14, fontWeight: '900', marginBottom: 2 },
  readonly: { minHeight: 50, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, justifyContent: 'center' },
  profileMenu: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  unreadCard: { borderColor: '#9BCFBC', backgroundColor: '#F4FBF8' },
  roomIconRead: { backgroundColor: colors.textMuted },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  notificationTime: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scoreBubble: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  scoreBubbleText: { color: colors.primary, fontSize: 16, fontWeight: '900' },
  achievementCard: { width: '100%' },
  achievementIcon: { width: 54, height: 54, borderRadius: radius.lg, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  qiblaCard: { alignItems: 'center', paddingVertical: spacing.xxl },
  compassRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 10, borderColor: colors.primarySoft, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 18 },
  compassNeedle: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 90, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.primary },
  compassNorth: { position: 'absolute', bottom: 16, color: colors.primaryDark, fontWeight: '900' },
  qiblaValue: { color: colors.primaryDark, fontSize: 34, fontWeight: '900', marginTop: spacing.lg },
})
