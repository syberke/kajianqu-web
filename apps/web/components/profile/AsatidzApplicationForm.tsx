'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Save,
  Send,
  Trash2,
  Upload,
  UserRoundCheck,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type ApplicationStatus =
  | 'PENDING_PROFILE'
  | 'PENDING_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

interface ApplicationData {
  id: string
  nama: string
  email: string
  noWa: string | null
  title: string
  bidang: string
  bio: string
  formalEducation: string
  nonformalEducation: string
  teachingExperience: string
  memorizationJuz: number
  sanadHistory: string
  teachingArea: string
  bank: string
  bankAccountType: string
  bankAccountName: string
  bankAccountNumber: string
  expertiseTagIds: string[]
  status: ApplicationStatus
  approved: boolean
  asatidzCode: string | null
  reviewNote: string | null
  submittedAt: string | null
}

interface ExpertiseTag {
  id: string
  name: string
  description: string | null
}

interface DocumentItem {
  id: string
  documentType: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  status: string
  uploadedAt: string
}

const STATUS_COPY: Record<ApplicationStatus, { title: string; description: string; tone: string }> = {
  PENDING_PROFILE: {
    title: 'Lengkapi pendaftaran Asatidz',
    description: 'Isi data wajib, pilih keilmuan, unggah CV, lalu kirim untuk ditinjau admin.',
    tone: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  PENDING_REVIEW: {
    title: 'Pendaftaran sedang ditinjau',
    description: 'Admin sedang memeriksa profil dan dokumen. Fitur mengajar aktif setelah disetujui.',
    tone: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  REVISION_REQUIRED: {
    title: 'Pendaftaran perlu diperbaiki',
    description: 'Periksa catatan admin, perbarui data atau dokumen, lalu kirim ulang.',
    tone: 'border-orange-200 bg-orange-50 text-orange-800',
  },
  APPROVED: {
    title: 'Akun Asatidz terverifikasi',
    description: 'Semua fitur mengajar, kelas, live, chat, dan materi sudah dapat digunakan.',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  REJECTED: {
    title: 'Pendaftaran belum dapat diterima',
    description: 'Anda tetap dapat memperbarui data sesuai catatan admin dan mengirim ulang.',
    tone: 'border-red-200 bg-red-50 text-red-800',
  },
  SUSPENDED: {
    title: 'Akses Asatidz ditangguhkan',
    description: 'Hubungi admin KajianQu untuk klarifikasi dan pemulihan akun.',
    tone: 'border-red-200 bg-red-50 text-red-800',
  },
}

const DOCUMENT_LABELS: Record<string, string> = {
  cv: 'CV / riwayat hidup',
  certificate: 'Sertifikat',
  sanad: 'Dokumen sanad',
  identity: 'Identitas',
  other: 'Dokumen pendukung',
}

const initialApplication: ApplicationData = {
  id: '',
  nama: '',
  email: '',
  noWa: '',
  title: '',
  bidang: '',
  bio: '',
  formalEducation: '',
  nonformalEducation: '',
  teachingExperience: '',
  memorizationJuz: 0,
  sanadHistory: '',
  teachingArea: '',
  bank: '',
  bankAccountType: '',
  bankAccountName: '',
  bankAccountNumber: '',
  expertiseTagIds: [],
  status: 'PENDING_PROFILE',
  approved: false,
  asatidzCode: null,
  reviewNote: null,
  submittedAt: null,
}

export default function AsatidzApplicationForm() {
  const [application, setApplication] = useState<ApplicationData>(initialApplication)
  const [tags, setTags] = useState<ExpertiseTag[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [documentType, setDocumentType] = useState('cv')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const load = async () => {
    const response = await fetch('/api/asatidz/application', { headers: { Accept: 'application/json' } })
    const payload = (await response.json().catch(() => null)) as {
      application?: ApplicationData
      tags?: ExpertiseTag[]
      documents?: DocumentItem[]
      error?: string
    } | null
    if (!response.ok || !payload?.application) throw new Error(payload?.error || 'Gagal memuat pendaftaran.')
    setApplication(payload.application)
    setTags(payload.tags ?? [])
    setDocuments(payload.documents ?? [])
  }

  useEffect(() => {
    void load()
      .catch((cause) => setMessage({ tone: 'error', text: cause instanceof Error ? cause.message : 'Gagal memuat data.' }))
      .finally(() => setLoading(false))
  }, [])

  const editable = ['PENDING_PROFILE', 'REVISION_REQUIRED', 'REJECTED'].includes(application.status)
  const hasCv = documents.some((document) => document.documentType === 'cv')
  const requiredComplete = useMemo(() => Boolean(
    application.nama.trim()
      && application.noWa?.trim()
      && application.formalEducation.trim()
      && application.teachingExperience.trim()
      && application.bank.trim()
      && application.bankAccountType.trim()
      && application.bankAccountName.trim()
      && application.bankAccountNumber.trim()
      && application.expertiseTagIds.length
      && hasCv,
  ), [application, hasCv])

  const update = <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => {
    setApplication((current) => ({ ...current, [key]: value }))
  }

  const save = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!editable) return false
    setSaving(true)
    setMessage(null)
    const response = await fetch('/api/asatidz/application', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(application),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    setSaving(false)
    if (!response.ok) {
      setMessage({ tone: 'error', text: payload?.error || 'Gagal menyimpan pendaftaran.' })
      return false
    }
    setMessage({ tone: 'success', text: 'Data pendaftaran berhasil disimpan.' })
    return true
  }

  const submitApplication = async () => {
    const saved = await save()
    if (!saved) return
    setSubmitting(true)
    const response = await fetch('/api/asatidz/application', { method: 'POST' })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    setSubmitting(false)
    if (!response.ok) {
      setMessage({ tone: 'error', text: payload?.error || 'Pendaftaran belum dapat dikirim.' })
      return
    }
    setMessage({ tone: 'success', text: 'Pendaftaran berhasil dikirim untuk ditinjau admin.' })
    await load()
  }

  const uploadDocument = async (file: File | null) => {
    if (!file || !editable) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage({ tone: 'error', text: 'Gunakan PDF, JPG, atau PNG dengan ukuran maksimal 10 MB.' })
      return
    }

    setUploading(true)
    setMessage(null)
    const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg'
    const path = `${application.id}/${documentType}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('asatidz-private')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })

    if (uploadError) {
      setMessage({ tone: 'error', text: uploadError.message })
      setUploading(false)
      return
    }

    const response = await fetch('/api/asatidz/application', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType,
        storagePath: path,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    })
    if (!response.ok) {
      await supabase.storage.from('asatidz-private').remove([path])
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setMessage({ tone: 'error', text: payload?.error || 'Metadata dokumen gagal disimpan.' })
    } else {
      setMessage({ tone: 'success', text: 'Dokumen berhasil diunggah.' })
      await load()
    }
    setUploading(false)
  }

  const deleteDocument = async (id: string) => {
    if (!editable || !window.confirm('Hapus dokumen ini?')) return
    const response = await fetch(`/api/asatidz/application?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setMessage({ tone: 'error', text: payload?.error || 'Dokumen gagal dihapus.' })
    else {
      setDocuments((items) => items.filter((item) => item.id !== id))
      setMessage({ tone: 'success', text: 'Dokumen berhasil dihapus.' })
    }
  }

  if (loading) {
    return <div className="grid min-h-72 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" size={36} /></div>
  }

  const statusCopy = STATUS_COPY[application.status] ?? STATUS_COPY.PENDING_PROFILE

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-[32px] bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10"><UserRoundCheck size={27} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Profil & Verifikasi</p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">{application.nama || 'Pendaftaran Asatidz'}</h1>
              <p className="mt-1 break-all text-sm text-white/65">{application.email}</p>
            </div>
          </div>
          {application.asatidzCode && (
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Kode Asatidz</p>
              <p className="mt-1 font-mono font-black">{application.asatidzCode}</p>
            </div>
          )}
        </div>
      </section>

      <section className={`rounded-2xl border p-5 ${statusCopy.tone}`}>
        <div className="flex items-start gap-3">
          {application.status === 'APPROVED' ? <BadgeCheck className="mt-0.5 shrink-0" /> : <AlertCircle className="mt-0.5 shrink-0" />}
          <div>
            <h2 className="font-black">{statusCopy.title}</h2>
            <p className="mt-1 text-sm leading-relaxed opacity-80">{statusCopy.description}</p>
            {application.reviewNote && (
              <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm">
                <span className="font-black">Catatan admin:</span> {application.reviewNote}
              </div>
            )}
          </div>
        </div>
      </section>

      {message && (
        <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${message.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.tone === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={(event) => void save(event)} className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <FormSection title="Identitas & latar belakang" subtitle="Data ini dipakai admin untuk menilai kelayakan akun Asatidz.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nama lengkap" required value={application.nama} disabled={!editable} onChange={(value) => update('nama', value)} />
              <Field label="Nomor WhatsApp" required value={application.noWa ?? ''} disabled={!editable} placeholder="08..." onChange={(value) => update('noWa', value)} />
              <Field label="Gelar / sapaan" value={application.title} disabled={!editable} placeholder="Contoh: Ust., Lc., M.A." onChange={(value) => update('title', value)} />
              <Field label="Bidang utama" value={application.bidang} disabled={!editable} placeholder="Contoh: Fikih Muamalat" onChange={(value) => update('bidang', value)} />
            </div>
            <TextArea label="Biografi singkat" value={application.bio} disabled={!editable} onChange={(value) => update('bio', value)} />
            <TextArea label="Pendidikan formal" required value={application.formalEducation} disabled={!editable} onChange={(value) => update('formalEducation', value)} />
            <TextArea label="Pendidikan nonformal / pesantren" value={application.nonformalEducation} disabled={!editable} onChange={(value) => update('nonformalEducation', value)} />
            <TextArea label="Pengalaman mengajar" required value={application.teachingExperience} disabled={!editable} onChange={(value) => update('teachingExperience', value)} />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Jumlah hafalan juz <Required /></span>
                <input type="number" min={0} max={30} step={0.5} required disabled={!editable} value={application.memorizationJuz} onChange={(event) => update('memorizationJuz', Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500 disabled:bg-slate-50" />
              </label>
              <Field label="Wilayah mengajar" value={application.teachingArea} disabled={!editable} placeholder="Kota / daring" onChange={(value) => update('teachingArea', value)} />
            </div>
            <TextArea label="Riwayat sanad (jika ada)" value={application.sanadHistory} disabled={!editable} onChange={(value) => update('sanadHistory', value)} />
          </FormSection>

          <FormSection title="Keilmuan" subtitle="Tag dibuat dan dikelola admin agar kategori tetap konsisten.">
            {tags.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">Belum ada tag aktif. Admin perlu membuat tag keilmuan terlebih dahulu.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = application.expertiseTagIds.includes(tag.id)
                  return (
                    <button key={tag.id} type="button" disabled={!editable} title={tag.description ?? undefined} onClick={() => update('expertiseTagIds', selected ? application.expertiseTagIds.filter((id) => id !== tag.id) : [...application.expertiseTagIds, tag.id])} className={`rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed ${selected ? 'border-[#064E3B] bg-[#064E3B] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'}`}>
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            )}
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Rekening fee" subtitle="Data rekening bersifat privat dan hanya dipakai untuk pembayaran fee.">
            <Field label="Bank / penyedia" required value={application.bank} disabled={!editable} placeholder="BSI, BCA, BRI, dan lainnya" onChange={(value) => update('bank', value)} />
            <Field label="Jenis rekening" required value={application.bankAccountType} disabled={!editable} placeholder="Tabungan / Giro" onChange={(value) => update('bankAccountType', value)} />
            <Field label="Nama pemilik rekening" required value={application.bankAccountName} disabled={!editable} onChange={(value) => update('bankAccountName', value)} />
            <Field label="Nomor rekening" required value={application.bankAccountNumber} disabled={!editable} inputMode="numeric" onChange={(value) => update('bankAccountNumber', value.replace(/\D/g, ''))} />
          </FormSection>

          <FormSection title="Dokumen verifikasi" subtitle="CV wajib. Sertifikat, sanad, dan dokumen lain bersifat pendukung.">
            {editable && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-4">
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">
                  {Object.entries(DOCUMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100">
                  {uploading ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
                  {uploading ? 'Mengunggah...' : 'Pilih PDF / gambar'}
                  <input type="file" className="sr-only" disabled={uploading} accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => void uploadDocument(event.target.files?.[0] ?? null)} />
                </label>
                <p className="mt-2 text-center text-xs text-slate-400">Maksimal 10 MB per dokumen.</p>
              </div>
            )}

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada dokumen.</p>
              ) : documents.map((document) => (
                <div key={document.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileText size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{DOCUMENT_LABELS[document.documentType] ?? document.documentType}</p>
                    <p className="text-xs text-slate-400">{(document.sizeBytes / 1024 / 1024).toFixed(2)} MB · {document.status}</p>
                  </div>
                  {editable && <button type="button" onClick={() => void deleteDocument(document.id)} aria-label="Hapus dokumen" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button>}
                </div>
              ))}
            </div>
          </FormSection>

          {editable && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={saving || submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 font-black text-emerald-700 disabled:opacity-50">
                  {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
                  Simpan Data
                </button>
                <button type="button" onClick={() => void submitApplication()} disabled={!requiredComplete || saving || submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {submitting ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}
                  Kirim untuk Verifikasi
                </button>
                {!requiredComplete && <p className="text-center text-xs leading-relaxed text-amber-600">Lengkapi data bertanda wajib, pilih minimal satu keilmuan, dan unggah CV.</p>}
              </div>
            </section>
          )}
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-emerald-950">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

function Required() {
  return <span className="text-red-500">*</span>
}

function Field({ label, required, value, onChange, disabled, placeholder, inputMode }: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  inputMode?: 'text' | 'numeric'
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label} {required && <Required />}</span>
      <input required={required} value={value} disabled={disabled} inputMode={inputMode} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500" />
    </label>
  )
}

function TextArea({ label, required, value, onChange, disabled }: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label} {required && <Required />}</span>
      <textarea rows={4} required={required} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 leading-relaxed outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500" />
    </label>
  )
}
