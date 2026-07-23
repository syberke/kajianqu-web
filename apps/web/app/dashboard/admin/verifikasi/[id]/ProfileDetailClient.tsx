'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Edit3,
  GraduationCap,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react'

import { reviewAsatidzApplication, updateUser } from '../action'

interface AsatidzDetail {
  id: string
  nama: string
  email: string
  role: string
  no_wa: string | null
  created_at: string
  foto_url: string | null
  asatidz_profiles: {
    bidang: string | null
    approved: boolean
    status: string
    asatidz_code: string | null
    title: string | null
    formal_education: string | null
    nonformal_education: string | null
    memorization_juz: number | null
    sanad_history: string | null
    bank: string | null
    bank_account_type: string | null
    bank_account_name: string | null
    no_rekening: string | null
    teaching_area: string | null
    review_note: string | null
    submitted_at: string | null
    cv_url: string | null
    latar_belakang: string | null
    sertifikat: string | null
    keahlian: string | null
    pengalaman_mengajar: string | null
    bio: string | null
    expertise: Array<{ id: string; name: string }>
    documents: Array<{
      id: string
      type: string
      status: string
      sizeBytes: number
      uploadedAt: string
      url: string | null
    }>
  } | null
  stats: {
    totalClasses: number
    totalStudents: number
    rating: number | null
  }
  enrollments: Array<{
    id: string
    className: string
    level: string
    studentName: string
    createdAt: string
    status: string
  }>
}

export default function ProfileDetailClient({ user }: { user: AsatidzDetail }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [form, setForm] = useState({
    nama: user.nama,
    no_wa: user.no_wa || '',
  })
  const [reviewNote, setReviewNote] = useState(user.asatidz_profiles?.review_note || '')

  const approved = user.asatidz_profiles?.approved ?? false
  const initials = user.nama
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const saveProfile = async () => {
    setLoadingAction('save')
    const result = await updateUser(user.id, form.nama, form.no_wa, user.role)
    setLoadingAction(null)
    if (result.error) {
      alert(result.error)
      return
    }
    setEditing(false)
    router.refresh()
  }

  const decide = async (decision: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED') => {
    const labels = {
      APPROVED: 'setujui',
      REVISION_REQUIRED: 'minta revisi untuk',
      REJECTED: 'tolak',
    }
    if (!window.confirm(`Yakin ingin ${labels[decision]} pendaftaran ${user.nama}?`)) return

    setLoadingAction(decision)
    const result = await reviewAsatidzApplication(user.id, decision, reviewNote)
    setLoadingAction(null)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => router.back()} className="rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-50">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Profil Verifikasi</h1>
          <p className="text-sm text-gray-500">Review profil, pengalaman, dan aktivitas pengajaran Asatidz.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-[#064E3B] text-3xl font-black text-white">
              {user.foto_url ? <img src={user.foto_url} alt={user.nama} className="h-full w-full object-cover" /> : initials}
            </div>
            <h2 className="mt-4 text-xl font-black text-gray-900">{user.nama}</h2>
            <p className="mt-1 text-sm text-gray-500">{user.asatidz_profiles?.title ? `${user.asatidz_profiles.title} · ` : ''}{user.asatidz_profiles?.bidang || 'Bidang belum diisi'}</p>
            <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {approved ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {approved ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </span>
            {user.asatidz_profiles?.asatidz_code && <p className="mt-3 font-mono text-xs font-black text-emerald-800">{user.asatidz_profiles.asatidz_code}</p>}

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-left text-sm">
              <div className="flex items-start gap-3"><Mail size={16} className="mt-0.5 text-gray-400" /><span className="break-all text-gray-700">{user.email || '-'}</span></div>
              <div className="flex items-start gap-3"><Phone size={16} className="mt-0.5 text-gray-400" /><span className="text-gray-700">{user.no_wa || '-'}</span></div>
              <div className="flex items-start gap-3"><GraduationCap size={16} className="mt-0.5 text-gray-400" /><span className="text-gray-700">Bergabung {new Date(user.created_at).toLocaleDateString('id-ID')}</span></div>
            </div>

            <div className="mt-5 space-y-2">
              {(user.asatidz_profiles?.documents ?? []).length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-400">Dokumen belum diunggah</div>
              ) : user.asatidz_profiles?.documents.map((document) => document.url ? (
                <a key={document.id} href={document.url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-xs font-bold text-emerald-800">
                  <span className="truncate capitalize">{document.type.replaceAll('_', ' ')}</span><Download size={15} />
                </a>
              ) : null)}
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-emerald-800"><ShieldCheck size={18} /><h3 className="font-black">Aksi Verifikasi</h3></div>
            <label className="mt-4 block">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Catatan review</span>
              <textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Wajib untuk revisi atau penolakan..." className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </label>
            <button type="button" onClick={() => void decide('APPROVED')} disabled={loadingAction !== null || approved} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
              {loadingAction === 'APPROVED' ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
              Setujui Asatidz
            </button>
            <button type="button" onClick={() => void decide('REVISION_REQUIRED')} disabled={loadingAction !== null} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 disabled:opacity-60">
              {loadingAction === 'REVISION_REQUIRED' ? <LoaderCircle className="animate-spin" size={17} /> : <Edit3 size={17} />} Minta Revisi
            </button>
            <button type="button" onClick={() => void decide('REJECTED')} disabled={loadingAction !== null} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 disabled:opacity-60">
              {loadingAction === 'REJECTED' ? <LoaderCircle className="animate-spin" size={17} /> : <XCircle size={17} />} Tolak Pendaftaran
            </button>
          </section>
        </aside>

        <main className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Materi / Kelas" value={user.stats.totalClasses} icon={<BookOpen size={19} />} />
            <Stat label="Santri Unik" value={user.stats.totalStudents} icon={<Users size={19} />} />
            <Stat label="Rating" value={user.stats.rating === null ? 'Belum ada' : user.stats.rating.toFixed(1)} icon={<Award size={19} />} />
          </div>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-black text-gray-900">Profil & Keilmuan</h2><p className="mt-1 text-sm text-gray-500">Data profil aplikasi dan metadata Asatidz.</p></div>
              <button type="button" onClick={() => setEditing((value) => !value)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600">
                <Edit3 size={16} /> {editing ? 'Batal' : 'Edit Profil'}
              </button>
            </div>

            {editing ? (
              <div className="mt-6 space-y-4">
                <label className="block"><span className="text-xs font-black uppercase tracking-wider text-gray-500">Nama</span><input value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-emerald-500" /></label>
                <label className="block"><span className="text-xs font-black uppercase tracking-wider text-gray-500">WhatsApp</span><input value={form.no_wa} onChange={(event) => setForm({ ...form, no_wa: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-emerald-500" /></label>
                <button type="button" onClick={() => void saveProfile()} disabled={loadingAction !== null || !form.nama.trim()} className="flex items-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                  {loadingAction === 'save' ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />} Simpan Perubahan
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="Bidang" value={user.asatidz_profiles?.bidang} />
                <Info label="Keahlian" value={user.asatidz_profiles?.expertise.map((item) => item.name).join(', ') || user.asatidz_profiles?.keahlian} />
                <Info label="Latar Belakang" value={user.asatidz_profiles?.latar_belakang} />
                <Info label="Pendidikan Formal" value={user.asatidz_profiles?.formal_education} />
                <Info label="Pendidikan Nonformal" value={user.asatidz_profiles?.nonformal_education} />
                <Info label="Pengalaman Mengajar" value={user.asatidz_profiles?.pengalaman_mengajar} />
                <Info label="Hafalan" value={user.asatidz_profiles?.memorization_juz === null ? null : `${user.asatidz_profiles?.memorization_juz} juz`} />
                <Info label="Riwayat Sanad" value={user.asatidz_profiles?.sanad_history} />
                <Info label="Wilayah Mengajar" value={user.asatidz_profiles?.teaching_area} />
                <Info label="Bio" value={user.asatidz_profiles?.bio} />
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900">Data Rekening Fee</h2>
            <p className="mt-1 text-sm text-gray-500">Data privat ini hanya terlihat oleh admin dan pemilik akun.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="Bank" value={user.asatidz_profiles?.bank} />
              <Info label="Jenis Rekening" value={user.asatidz_profiles?.bank_account_type} />
              <Info label="Nama Pemilik" value={user.asatidz_profiles?.bank_account_name} />
              <Info label="Nomor Rekening" value={user.asatidz_profiles?.no_rekening} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div><h2 className="text-xl font-black text-gray-900">Aktivitas Pengajaran</h2><p className="mt-1 text-sm text-gray-500">Enrollment santri pada materi/kelas milik Asatidz ini.</p></div>
            {user.enrollments.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-gray-50 py-12 text-center text-sm text-gray-400">Belum ada enrollment santri.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead><tr className="border-b border-gray-100 text-xs font-black uppercase tracking-wider text-gray-400"><th className="pb-3">Santri</th><th className="pb-3">Kelas</th><th className="pb-3">Jenis</th><th className="pb-3">Status</th><th className="pb-3">Tanggal</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {user.enrollments.map((item) => (
                      <tr key={item.id}><td className="py-4 font-bold text-gray-800">{item.studentName}</td><td className="py-4 text-gray-600">{item.className}</td><td className="py-4 text-gray-500">{item.level}</td><td className="py-4"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{item.status}</span></td><td className="py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><p className="mt-4 text-2xl font-black text-gray-900">{value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></article>
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-gray-400">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{value || 'Belum diisi'}</p></div>
}
