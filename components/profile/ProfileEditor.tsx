'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Save, UserRound } from 'lucide-react'

interface ProfileData {
  id: string
  nama: string | null
  email: string | null
  fotoUrl: string | null
  noWa: string | null
  bank: string | null
  noRekening: string | null
  role: string | null
  bidang: string | null
}

export default function ProfileEditor({ asatidz = false }: { asatidz?: boolean }) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const response = await fetch('/api/profile', { headers: { Accept: 'application/json' } })
      const payload = (await response.json().catch(() => null)) as { profile?: ProfileData; error?: string } | null
      if (cancelled) return
      if (!response.ok || !payload?.profile) {
        setMessage({ type: 'error', text: payload?.error ?? 'Gagal memuat profil' })
      } else {
        setProfile(payload.profile)
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage(null)

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        nama: profile.nama ?? '',
        noWa: profile.noWa ?? '',
        ...(asatidz
          ? {
              bidang: profile.bidang ?? '',
              bank: profile.bank ?? '',
              noRekening: profile.noRekening ?? '',
            }
          : {}),
      }),
    })
    const payload = (await response.json().catch(() => null)) as { profile?: ProfileData; error?: string } | null
    if (!response.ok || !payload?.profile) {
      setMessage({ type: 'error', text: payload?.error ?? 'Gagal menyimpan profil' })
    } else {
      setProfile(payload.profile)
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' })
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" size={34} /></div>
  }

  if (!profile) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Profil tidak dapat dimuat.</div>
  }

  const update = (key: keyof ProfileData, value: string) => setProfile((current) => current ? { ...current, [key]: value } : current)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10"><UserRound size={26} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Profil {asatidz ? 'Asatidz' : 'Siswa'}</p>
            <h1 className="mt-1 text-2xl font-black">{profile.nama || 'Pengguna KajianQu'}</h1>
            <p className="mt-1 text-sm text-white/65">{profile.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {message && (
          <div className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm ${message.type === 'success' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Nama lengkap</span>
            <input required value={profile.nama ?? ''} onChange={(event) => update('nama', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input value={profile.email ?? ''} disabled className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Nomor WhatsApp</span>
            <input value={profile.noWa ?? ''} onChange={(event) => update('noWa', event.target.value)} placeholder="08..." className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          {asatidz && (
            <>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Bidang keilmuan</span>
                <input value={profile.bidang ?? ''} onChange={(event) => update('bidang', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Bank</span>
                  <input value={profile.bank ?? ''} onChange={(event) => update('bank', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Nomor rekening</span>
                  <input value={profile.noRekening ?? ''} onChange={(event) => update('noRekening', event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-6">
            <button type="submit" disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 font-bold text-white transition hover:bg-[#043f30] disabled:opacity-60">
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
