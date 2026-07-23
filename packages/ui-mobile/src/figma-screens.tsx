import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ExpoLinking from 'expo-linking'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  GraduationCap,
  KeyRound,
  Landmark,
  Library,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Video,
} from 'lucide-react-native'
import {
  createLiveEvent,
  createMaterial,
  ensureClassChat,
  getSupabase,
  getCurrentProfile,
  joinPrivateClass,
  listClassSessions,
  listOwnLiveEvents,
  listOwnMaterials,
  listPrivateClasses,
  updateCurrentProfile,
  updatePassword,
} from '@kajianku/api-client'
import { colors, radius, shadow, spacing } from '@kajianku/design-tokens'

export type FigmaNavigate = (href: string) => void

function Screen({
  children,
  title,
  subtitle,
  navigate,
}: {
  children: ReactNode
  title: string
  subtitle?: string
  navigate?: FigmaNavigate
}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.header}>
        <View style={styles.headerOrnament} />
        {navigate ? (
          <Pressable accessibilityLabel="Kembali" onPress={() => navigate('..')} style={styles.backButton}>
            <ArrowLeft color={colors.white} size={21} />
          </Pressable>
        ) : null}
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.sheet}>{children}</View>
    </ScrollView>
  )
}

function Card({ children, onPress, selected = false }: { children: ReactNode; onPress?: () => void; selected?: boolean }) {
  const content = <View style={[styles.card, selected && styles.cardSelected]}>{children}</View>
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  ) : content
}

function Button({
  label,
  onPress,
  disabled,
  tone = 'primary',
  icon,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: 'primary' | 'soft' | 'danger'
  icon?: ReactNode
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'soft' && styles.buttonSoft,
        tone === 'danger' && styles.buttonDanger,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, tone === 'soft' && styles.buttonSoftText]}>{label}</Text>
    </Pressable>
  )
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  secureTextEntry,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad' | 'url'
  secureTextEntry?: boolean
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#98A59F"
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.textarea]}
        value={value}
      />
    </View>
  )
}

function QueryMessage({ loading, error }: { loading: boolean; error?: Error | null }) {
  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Memuat data...</Text>
      </View>
    )
  }
  if (error) {
    return (
      <View style={[styles.notice, styles.noticeError]}>
        <CircleAlert color={colors.danger} size={20} />
        <Text style={styles.noticeText}>{error.message}</Text>
      </View>
    )
  }
  return null
}

export function RoleSelectionScreen({ navigate }: { navigate: FigmaNavigate }) {
  return (
    <View style={styles.rolePage}>
      <View style={styles.roleBrand}>
        <BookOpen color={colors.gold} size={64} strokeWidth={2.2} />
        <Text style={styles.roleLogo}>KajianQu</Text>
        <Text style={styles.roleWelcome}>Selamat Datang di KajianQu</Text>
        <Text style={styles.roleLead}>Pilih peran untuk melanjutkan perjalanan belajar.</Text>
      </View>
      <View style={styles.roleCards}>
        <Card onPress={() => navigate('/register?role=siswa')}>
          <View style={[styles.roleIcon, styles.roleIconStudent]}><UserRound color={colors.primary} size={29} /></View>
          <View style={styles.flex}>
            <Text style={styles.title}>Santri</Text>
            <Text style={styles.muted}>Belajar, mengikuti kelas, membaca Quran, dan berlatih bersama AI.</Text>
          </View>
          <ChevronRight color={colors.primary} size={22} />
        </Card>
        <Card onPress={() => navigate('/register?role=asatidz')}>
          <View style={[styles.roleIcon, styles.roleIconTeacher]}><GraduationCap color="#8E7000" size={29} /></View>
          <View style={styles.flex}>
            <Text style={styles.title}>Asatidz</Text>
            <Text style={styles.muted}>Mengajar, mengelola materi, kelas, jadwal live, dan chat santri.</Text>
          </View>
          <ChevronRight color={colors.primary} size={22} />
        </Card>
      </View>
      <Pressable onPress={() => navigate('/login')}>
        <Text style={styles.loginLink}>Sudah memiliki akun? Masuk di sini</Text>
      </Pressable>
    </View>
  )
}

export function ProfileEditScreen({ navigate }: { navigate: FigmaNavigate }) {
  const queryClient = useQueryClient()
  const profile = useQuery({ queryKey: ['current-profile'], queryFn: getCurrentProfile })
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'undisclosed'>('undisclosed')
  const [address, setAddress] = useState('')
  const [bidang, setBidang] = useState('')
  const [bank, setBank] = useState('')
  const [account, setAccount] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!profile.data) return
    setName(profile.data.nama)
    setWhatsapp(profile.data.noWa || '')
    setBirthDate(profile.data.birthDate || '')
    setGender(profile.data.gender || 'undisclosed')
    setAddress(profile.data.addressSummary || '')
    setBidang(profile.data.bidang || '')
    setBank(profile.data.bank || '')
    setAccount(profile.data.noRekening || '')
  }, [profile.data])

  async function save() {
    setBusy(true)
    setMessage(null)
    try {
      await updateCurrentProfile({
        nama: name,
        noWa: whatsapp,
        birthDate,
        gender,
        addressSummary: address,
        bidang,
        bank,
        noRekening: account,
      })
      await queryClient.invalidateQueries({ queryKey: ['current-profile'] })
      setMessage('Perubahan profil berhasil disimpan.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Profil belum berhasil disimpan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Edit profil" subtitle="Lengkapi data akun KajianQu" navigate={navigate}>
      <QueryMessage loading={profile.isLoading} error={profile.error} />
      {profile.data ? (
        <Card>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{profile.data.nama.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Field label="Nama lengkap" value={name} onChangeText={setName} placeholder="Masukkan nama lengkap" />
          <Field label="Nomor WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
          {profile.data.role === 'siswa' ? (
            <>
              <Field label="Tanggal lahir" value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>Jenis kelamin</Text>
              <View style={styles.pills}>
                {([
                  ['male', 'Laki-laki'],
                  ['female', 'Perempuan'],
                  ['undisclosed', 'Tidak disebutkan'],
                ] as const).map(([value, label]) => (
                  <Pressable key={value} onPress={() => setGender(value)} style={[styles.pill, gender === value && styles.pillActive]}>
                    <Text style={[styles.pillText, gender === value && styles.pillTextActive]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <Field label="Alamat lengkap" value={address} onChangeText={setAddress} multiline placeholder="Provinsi, kota, dan alamat" />
            </>
          ) : null}
          {profile.data.role === 'asatidz' ? (
            <>
              <Field label="Bidang keilmuan" value={bidang} onChangeText={setBidang} placeholder="Tahfidz, Fikih, Tafsir..." />
              <Field label="Nama bank" value={bank} onChangeText={setBank} placeholder="Bank yang digunakan" />
              <Field label="Nomor rekening" value={account} onChangeText={setAccount} keyboardType="number-pad" placeholder="Nomor rekening" />
              <View style={styles.notice}>
                <Check color={colors.primary} size={18} />
                <Text style={styles.noticeText}>Status verifikasi: {profile.data.approvalStatus || 'PENDING_PROFILE'}</Text>
              </View>
            </>
          ) : null}
          {message ? <Text style={styles.formMessage}>{message}</Text> : null}
          <Button label={busy ? 'Menyimpan...' : 'Simpan perubahan'} disabled={busy || !name.trim()} onPress={() => void save()} />
        </Card>
      ) : null}
    </Screen>
  )
}

export function ChangePasswordScreen({ navigate }: { navigate: FigmaNavigate }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function save() {
    setMessage(null)
    if (password !== confirmation) {
      setMessage('Konfirmasi kata sandi belum sama.')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setPassword('')
      setConfirmation('')
      setMessage('Kata sandi berhasil diperbarui.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Kata sandi belum berhasil diperbarui.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Ubah sandi" subtitle="Gunakan kombinasi yang kuat dan mudah Anda ingat" navigate={navigate}>
      <Card>
        <View style={styles.centerIcon}><KeyRound color={colors.primary} size={28} /></View>
        <Field label="Kata sandi baru" value={password} onChangeText={setPassword} secureTextEntry />
        <Field label="Konfirmasi kata sandi" value={confirmation} onChangeText={setConfirmation} secureTextEntry />
        {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        <Button label={busy ? 'Menyimpan...' : 'Simpan perubahan'} disabled={busy || password.length < 8 || !confirmation} onPress={() => void save()} />
      </Card>
    </Screen>
  )
}

export function ForgotPasswordScreen({ navigate }: { navigate: FigmaNavigate }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setMessage(null)
    try {
      const redirectTo = ExpoLinking.createURL('/auth/callback', {
        queryParams: { next: '/reset-password' },
      })
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (error) throw error
      setMessage('Tautan pemulihan sudah dikirim. Periksa inbox dan folder spam email Anda.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Email pemulihan belum berhasil dikirim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Lupa kata sandi" subtitle="Kami akan mengirim tautan pemulihan ke email terdaftar" navigate={navigate}>
      <Card>
        <View style={styles.centerIcon}><KeyRound color={colors.primary} size={28} /></View>
        <Field label="Alamat email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="nama@email.com" />
        {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        <Button
          label={busy ? 'Mengirim...' : 'Kirim tautan pemulihan'}
          disabled={busy || !email.includes('@')}
          onPress={() => void submit()}
        />
      </Card>
    </Screen>
  )
}

export function ResetPasswordScreen({ navigate }: { navigate: FigmaNavigate }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setMessage(null)
    if (password !== confirmation) {
      setMessage('Konfirmasi kata sandi belum sama.')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setMessage('Kata sandi berhasil diperbarui. Silakan masuk kembali.')
      setTimeout(() => navigate('/login'), 800)
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Kata sandi belum berhasil diperbarui.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Atur kata sandi baru" subtitle="Gunakan minimal delapan karakter" navigate={navigate}>
      <Card>
        <View style={styles.centerIcon}><KeyRound color={colors.primary} size={28} /></View>
        <Field label="Kata sandi baru" value={password} onChangeText={setPassword} secureTextEntry />
        <Field label="Konfirmasi kata sandi" value={confirmation} onChangeText={setConfirmation} secureTextEntry />
        {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        <Button label={busy ? 'Menyimpan...' : 'Simpan kata sandi'} disabled={busy || password.length < 8} onPress={() => void submit()} />
      </Card>
    </Screen>
  )
}

export function AsatidzMaterialsScreen({ navigate }: { navigate: FigmaNavigate }) {
  const materials = useQuery({ queryKey: ['own-materials'], queryFn: listOwnMaterials })
  const live = useQuery({ queryKey: ['own-live-events'], queryFn: listOwnLiveEvents })
  return (
    <Screen title="Kelola materimu" subtitle="Materi dan jadwal live yang Anda kirim" navigate={navigate}>
      <View style={styles.quickActions}>
        <Pressable onPress={() => navigate('/asatidz/materials/new')} style={styles.quickAction}>
          <Upload color={colors.white} size={22} />
          <Text style={styles.quickActionText}>Upload materi</Text>
        </Pressable>
        <Pressable onPress={() => navigate('/asatidz/live/new')} style={[styles.quickAction, styles.quickActionGold]}>
          <Video color="#5B4700" size={22} />
          <Text style={[styles.quickActionText, styles.quickActionGoldText]}>Buat jadwal live</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Materi</Text>
      <QueryMessage loading={materials.isLoading} error={materials.error} />
      {(materials.data || []).map((item) => (
        <Card key={item.id}>
          <View style={styles.listRow}>
            <View style={styles.mediaIcon}><Play color={colors.white} fill={colors.white} size={17} /></View>
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.muted}>{item.reviewStatus} • {item.workflowStatus}</Text>
            </View>
            <StatusChip label={item.isPublished ? 'Publik' : 'Review'} active={item.isPublished} />
          </View>
        </Card>
      ))}
      {!materials.isLoading && !materials.data?.length ? <Empty text="Belum ada materi. Upload materi pertama Anda." /> : null}
      <Text style={styles.sectionTitle}>Jadwal live</Text>
      <QueryMessage loading={live.isLoading} error={live.error} />
      {(live.data || []).map((item) => (
        <Card key={item.id}>
          <View style={styles.listRow}>
            <View style={styles.mediaIcon}><Video color={colors.white} size={18} /></View>
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.muted}>{new Date(item.startsAt).toLocaleString('id-ID')}</Text>
            </View>
            <StatusChip label={item.status} active={item.status === 'live'} />
          </View>
        </Card>
      ))}
    </Screen>
  )
}

function StatusChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.status, active && styles.statusActive]}>
      <Text style={[styles.statusText, active && styles.statusTextActive]}>{label}</Text>
    </View>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Library color={colors.primary} size={29} />
      <Text style={styles.muted}>{text}</Text>
    </View>
  )
}

export function CreateMaterialScreen({ navigate }: { navigate: FigmaNavigate }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('Pemula')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setMessage(null)
    try {
      await createMaterial({ title, summary, description, level, youtubeUrl, thumbnailUrl })
      await queryClient.invalidateQueries({ queryKey: ['own-materials'] })
      setMessage('Materi berhasil dikirim untuk proses review.')
      setTitle('')
      setSummary('')
      setDescription('')
      setYoutubeUrl('')
      setThumbnailUrl('')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Materi belum berhasil dikirim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Upload materi" subtitle="Materi akan ditinjau admin sebelum dipublikasikan" navigate={navigate}>
      <Card>
        <View style={styles.uploadCover}>
          <Upload color={colors.white} size={28} />
          <Text style={styles.uploadText}>Upload Cover</Text>
        </View>
        <Field label="Judul materi" value={title} onChangeText={setTitle} placeholder="Judul materi yang jelas" />
        <Text style={styles.label}>Tingkat materi</Text>
        <View style={styles.pills}>
          {['Pemula', 'Menengah', 'Lanjutan'].map((value) => (
            <Pressable key={value} onPress={() => setLevel(value)} style={[styles.pill, level === value && styles.pillActive]}>
              <Text style={[styles.pillText, level === value && styles.pillTextActive]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Link YouTube" value={youtubeUrl} onChangeText={setYoutubeUrl} keyboardType="url" placeholder="https://youtube.com/..." />
        <Field label="URL cover" value={thumbnailUrl} onChangeText={setThumbnailUrl} keyboardType="url" placeholder="https://..." />
        <Field label="Ringkasan" value={summary} onChangeText={setSummary} multiline placeholder="Ringkasan singkat materi" />
        <Field label="Deskripsi" value={description} onChangeText={setDescription} multiline placeholder="Jelaskan isi dan manfaat materi" />
        {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        <Button label={busy ? 'Mengirim...' : 'Upload publik'} disabled={busy || title.trim().length < 4} onPress={() => void submit()} />
      </Card>
    </Screen>
  )
}

export function CreateLiveEventScreen({ navigate }: { navigate: FigmaNavigate }) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState<'youtube' | 'zoom' | 'external'>('youtube')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    setBusy(true)
    setMessage(null)
    try {
      await createLiveEvent({ title, description, provider, startsAt, eventUrl: url })
      await queryClient.invalidateQueries({ queryKey: ['own-live-events'] })
      setMessage('Jadwal live berhasil dibuat.')
      setTitle('')
      setUrl('')
      setStartsAt('')
      setDescription('')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Jadwal live belum berhasil dibuat.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Buat jadwal live" subtitle="Gunakan tautan YouTube, Zoom, atau room eksternal" navigate={navigate}>
      <Card>
        <View style={styles.uploadCover}>
          <Video color={colors.white} size={28} />
          <Text style={styles.uploadText}>Jadwal Kajian Live</Text>
        </View>
        <Field label="Judul live" value={title} onChangeText={setTitle} placeholder="Judul kajian live" />
        <Text style={styles.label}>Penyedia siaran</Text>
        <View style={styles.pills}>
          {(['youtube', 'zoom', 'external'] as const).map((value) => (
            <Pressable key={value} onPress={() => setProvider(value)} style={[styles.pill, provider === value && styles.pillActive]}>
              <Text style={[styles.pillText, provider === value && styles.pillTextActive]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Link siaran" value={url} onChangeText={setUrl} keyboardType="url" placeholder="https://..." />
        <Field label="Tanggal dan waktu" value={startsAt} onChangeText={setStartsAt} placeholder="2026-07-25T19:00:00+07:00" />
        <Field label="Deskripsi" value={description} onChangeText={setDescription} multiline placeholder="Topik dan informasi live" />
        {message ? <Text style={styles.formMessage}>{message}</Text> : null}
        <Button label={busy ? 'Menyimpan...' : 'Buat jadwal live'} disabled={busy || !title.trim() || !url.trim() || !startsAt.trim()} onPress={() => void submit()} />
      </Card>
    </Screen>
  )
}

export function ClassDetailScreen({ id, navigate }: { id: string; navigate: FigmaNavigate }) {
  const classes = useQuery({ queryKey: ['private-classes'], queryFn: listPrivateClasses })
  const sessions = useQuery({ queryKey: ['class-sessions', id], queryFn: () => listClassSessions(id) })
  const selectedClass = useMemo(() => classes.data?.find((item) => item.id === id), [classes.data, id])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function join() {
    setBusy(true)
    setMessage(null)
    try {
      await joinPrivateClass(id)
      setMessage('Permintaan bergabung berhasil dikirim.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Belum berhasil bergabung.')
    } finally {
      setBusy(false)
    }
  }

  async function chat() {
    setBusy(true)
    setMessage(null)
    try {
      const roomId = await ensureClassChat(id)
      navigate(`/chat/${roomId}`)
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Chat kelas belum dapat dibuka.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen title="Kelas Online" subtitle="Materi, jadwal pertemuan, dan chat dalam satu ruang" navigate={navigate}>
      <QueryMessage loading={classes.isLoading} error={classes.error} />
      {selectedClass ? (
        <Card>
          <View style={styles.classCover}>
            <Video color={colors.white} size={38} />
            <Text style={styles.classCoverTitle}>{selectedClass.title}</Text>
          </View>
          <Text style={styles.title}>{selectedClass.title}</Text>
          <Text style={styles.muted}>{selectedClass.description || 'Kelas bersama asatidz KajianQu.'}</Text>
          <View style={styles.metaRow}><Users color={colors.primary} size={17} /><Text style={styles.muted}>Kapasitas {selectedClass.capacity} peserta</Text></View>
          <View style={styles.metaRow}><CalendarDays color={colors.primary} size={17} /><Text style={styles.muted}>{selectedClass.startsAt ? new Date(selectedClass.startsAt).toLocaleString('id-ID') : 'Jadwal menyusul'}</Text></View>
          {message ? <Text style={styles.formMessage}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            <Button label={busy ? 'Memproses...' : 'Gabung kelas'} disabled={busy} onPress={() => void join()} />
            <Button label="Chat kelas" disabled={busy} onPress={() => void chat()} tone="soft" icon={<MessageCircle color={colors.primary} size={17} />} />
          </View>
        </Card>
      ) : null}
      <Text style={styles.sectionTitle}>Jadwal pertemuan</Text>
      <QueryMessage loading={sessions.isLoading} error={sessions.error} />
      {(sessions.data || []).map((session) => (
        <Card key={session.id}>
          <View style={styles.listRow}>
            <View style={styles.sessionDate}><Clock3 color={colors.primary} size={19} /></View>
            <View style={styles.flex}>
              <Text style={styles.title}>{session.title}</Text>
              <Text style={styles.muted}>{new Date(session.startsAt).toLocaleString('id-ID')} • {session.durationMinutes} menit</Text>
              {session.meetingId ? <Text style={styles.muted}>Room: {session.meetingId}{session.passcode ? ` • ${session.passcode}` : ''}</Text> : null}
            </View>
          </View>
          {session.meetingUrl ? (
            <Button label="Masuk ruang kelas" onPress={() => void Linking.openURL(session.meetingUrl!)} icon={<Video color={colors.white} size={17} />} />
          ) : (
            <View style={styles.notice}><Clock3 color={colors.primary} size={18} /><Text style={styles.noticeText}>Tautan kelas belum dibuka oleh asatidz.</Text></View>
          )}
        </Card>
      ))}
      {!sessions.isLoading && !sessions.data?.length ? <Empty text="Belum ada sesi kelas yang dijadwalkan." /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.white },
  screenContent: { flexGrow: 1 },
  header: { minHeight: 160, backgroundColor: colors.primary, paddingHorizontal: 26, paddingTop: 50, paddingBottom: 24, justifyContent: 'flex-end', overflow: 'hidden' },
  headerOrnament: { position: 'absolute', right: -45, bottom: -65, width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderColor: 'rgba(255,255,255,0.09)' },
  backButton: { position: 'absolute', left: 20, top: 48, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.white, fontSize: 24, fontWeight: '900' },
  headerSubtitle: { color: '#DDF0E9', fontSize: 13, lineHeight: 19, marginTop: 4 },
  sheet: { flex: 1, marginTop: -2, backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 44, gap: 14 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, gap: 13, ...shadow.card },
  cardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.58 },
  title: { color: colors.text, fontSize: 15, fontWeight: '900', lineHeight: 21 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 9 },
  muted: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 50, flexDirection: 'row', gap: 8, borderRadius: radius.pill, paddingHorizontal: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  buttonSoft: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#B8DCCF' },
  buttonDanger: { backgroundColor: '#FF8F91' },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  buttonSoftText: { color: colors.primaryDark },
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 11, fontWeight: '800' },
  input: { minHeight: 50, backgroundColor: colors.white, borderWidth: 1, borderColor: '#D8E2DE', borderRadius: 11, paddingHorizontal: 14, color: colors.text, fontSize: 13, outlineStyle: 'none' } as object,
  textarea: { minHeight: 92, paddingTop: 13, textAlignVertical: 'top' },
  state: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 9 },
  notice: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 11, padding: 12 },
  noticeError: { backgroundColor: colors.dangerSoft },
  noticeText: { flex: 1, color: colors.primaryDark, fontSize: 12, lineHeight: 18 },
  formMessage: { color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: 9, padding: 11, fontSize: 12, lineHeight: 18 },
  rolePage: { flex: 1, minHeight: 820, backgroundColor: '#EFF8F3', paddingHorizontal: 28, paddingTop: 84, paddingBottom: 36, justifyContent: 'center' },
  roleBrand: { alignItems: 'center', marginBottom: 30 },
  roleLogo: { color: colors.primaryDark, fontSize: 34, fontWeight: '900', marginTop: 5 },
  roleWelcome: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 24 },
  roleLead: { color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' },
  roleCards: { gap: 15 },
  roleIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  roleIconStudent: { backgroundColor: colors.primarySoft },
  roleIconTeacher: { backgroundColor: colors.goldSoft },
  loginLink: { color: colors.primary, textAlign: 'center', fontSize: 12, fontWeight: '800', marginTop: 25 },
  avatarLarge: { width: 86, height: 86, borderRadius: 43, backgroundColor: colors.primary, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: colors.primarySoft },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '900' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { minHeight: 37, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  pillTextActive: { color: colors.white },
  centerIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primarySoft, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickAction: { flex: 1, minHeight: 92, borderRadius: 14, padding: 14, backgroundColor: colors.primary, justifyContent: 'space-between' },
  quickActionGold: { backgroundColor: colors.goldSoft },
  quickActionText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  quickActionGoldText: { color: '#5B4700' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mediaIcon: { width: 54, height: 44, borderRadius: 8, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  status: { borderRadius: radius.pill, backgroundColor: colors.goldSoft, paddingHorizontal: 9, paddingVertical: 5 },
  statusActive: { backgroundColor: colors.primarySoft },
  statusText: { color: '#876C00', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  statusTextActive: { color: colors.primary },
  empty: { minHeight: 140, borderWidth: 1, borderColor: colors.border, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 9, padding: 20 },
  uploadCover: { height: 145, borderRadius: 11, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  classCover: { height: 156, borderRadius: 11, backgroundColor: colors.primaryDark, padding: 18, justifyContent: 'flex-end', gap: 8 },
  classCoverTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  buttonRow: { gap: 8 },
  sessionDate: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
})
