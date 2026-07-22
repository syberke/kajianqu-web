'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Banknote, CheckCircle2, LoaderCircle, QrCode, Upload } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { uploadDonationProof } from '@/lib/storage/donation-proof'

interface DonationMethod {
  id: string
  method_type: string
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  qris_image_url: string | null
}

export default function StudentDonationPage() {
  const [methods, setMethods] = useState<DonationMethod[]>([])
  const [methodId, setMethodId] = useState('')
  const [category, setCategory] = useState('operasional')
  const [nominal, setNominal] = useState('')
  const [donorName, setDonorName] = useState('')
  const [note, setNote] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const requestedCategory = search.get('category')
    const requestedNominal = search.get('nominal')
    if (requestedCategory) setCategory(requestedCategory.slice(0, 80))
    if (requestedNominal && /^\d+$/.test(requestedNominal)) setNominal(requestedNominal)

    const load = async () => {
      const response = await fetch('/api/donation-methods', { headers: { Accept: 'application/json' } })
      const payload = (await response.json().catch(() => null)) as { methods?: DonationMethod[]; error?: string } | null
      if (!response.ok) setError(payload?.error ?? 'Gagal memuat metode donasi')
      else {
        const nextMethods = payload?.methods ?? []
        setMethods(nextMethods)
        setMethodId(nextMethods[0]?.id ?? '')
      }
      setLoading(false)
    }
    void load()
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Silakan masuk kembali sebelum mengirim donasi.')

      const paymentProofUrl = proof ? await uploadDonationProof(proof, user.id) : undefined
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          category,
          nominal: Number(nominal),
          methodId,
          donorName,
          note,
          paymentProofUrl,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) throw new Error(payload?.error ?? 'Gagal mengirim donasi')

      setSuccess(true)
      setNominal('')
      setNote('')
      setProof(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal mengirim donasi')
    } finally {
      setSaving(false)
    }
  }

  const selected = methods.find((method) => method.id === methodId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Donasi KajianQu</p><h1 className="mt-2 text-3xl font-black">Dukung keberlanjutan kajian</h1><p className="mt-2 max-w-2xl text-sm text-white/65">Metode pembayaran dan status transaksi berasal langsung dari sistem. Bukti pembayaran disimpan di Storage, sedangkan transaksi dicatat melalui API aplikasi.</p></section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} /> Donasi berhasil dikirim dan menunggu verifikasi admin.</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {loading ? <div className="grid h-56 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : methods.length === 0 ? <p className="py-12 text-center text-slate-500">Belum ada metode donasi aktif.</p> : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="text-sm font-bold text-slate-700">Kategori</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="operasional">Operasional</option><option value="dakwah">Program Dakwah</option><option value="pendidikan">Pendidikan</option><option value="wakaf-quran">Wakaf Al-Qur&apos;an</option><option value="sodaqoh">Sodaqoh Jariyah</option><option value="infaq-asatidz">Infaq Asatidz</option></select></label>
              <label><span className="text-sm font-bold text-slate-700">Nominal</span><input required min="1000" type="number" value={nominal} onChange={(event) => setNominal(event.target.value)} placeholder="50000" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" /></label>
            </div>
            <label><span className="text-sm font-bold text-slate-700">Nama donatur</span><input value={donorName} onChange={(event) => setDonorName(event.target.value)} placeholder="Kosongkan untuk nama akun" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4" /></label>
            <div><p className="text-sm font-bold text-slate-700">Metode pembayaran</p><div className="mt-2 grid gap-3 sm:grid-cols-2">{methods.map((method) => <button type="button" key={method.id} onClick={() => setMethodId(method.id)} className={`rounded-2xl border p-4 text-left ${methodId === method.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><div className="flex items-center gap-3">{method.method_type.toLowerCase().includes('qris') ? <QrCode className="text-emerald-700" /> : <Banknote className="text-emerald-700" />}<div><p className="font-bold text-slate-900">{method.bank_name || method.method_type}</p><p className="text-xs text-slate-500">{method.account_number || 'QRIS'}</p></div></div></button>)}</div></div>
            {selected && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><p className="font-bold text-slate-800">Tujuan pembayaran</p><p className="mt-1">{selected.bank_name || selected.method_type} {selected.account_number ? `· ${selected.account_number}` : ''}</p>{selected.account_name && <p>a.n. {selected.account_name}</p>}{selected.qris_image_url && <img src={selected.qris_image_url} alt="QRIS donasi" className="mt-3 max-h-64 rounded-xl object-contain" />}</div>}
            <label><span className="text-sm font-bold text-slate-700">Bukti pembayaran</span><span className="mt-2 flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center text-sm text-slate-500 hover:border-emerald-300"><input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => setProof(event.target.files?.[0] ?? null)} /><span><Upload className="mx-auto mb-2 text-slate-400" />{proof ? proof.name : 'Pilih foto atau PDF bukti pembayaran'}</span></span></label>
            <label><span className="text-sm font-bold text-slate-700">Catatan</span><textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
            <button type="submit" disabled={saving || !methodId} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D794E] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}{saving ? 'Mengirim...' : 'Kirim Donasi'}</button>
          </form>
        )}
      </section>
    </div>
  )
}
