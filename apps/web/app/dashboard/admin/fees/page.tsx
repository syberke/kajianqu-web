'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Banknote, CheckCircle2, LoaderCircle, Save, Upload } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

interface FeeMaterial {
  id: string
  title: string
  asatidzId: string
  asatidzName: string
  publishedAt: string | null
  fee: { id: string; amount: number; asatidzId: string; status: string; note: string | null; createdAt: string } | null
}

export default function AdminFeesPage() {
  const [materials, setMaterials] = useState<FeeMaterial[]>([])
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/admin/fees')
    const payload = (await response.json().catch(() => null)) as { materials?: FeeMaterial[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat fee.')
    const items = payload?.materials ?? []
    setMaterials(items)
    setAmounts(Object.fromEntries(items.map((item) => [item.id, item.fee ? String(item.fee.amount) : ''])))
    setNotes(Object.fromEntries(items.map((item) => [item.id, item.fee?.note ?? ''])))
  }

  useEffect(() => {
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : 'Gagal memuat fee.')).finally(() => setLoading(false))
  }, [])

  const withoutFee = useMemo(() => materials.filter((item) => !item.fee).length, [materials])

  const save = async (material: FeeMaterial) => {
    const amount = Number(amounts[material.id])
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Nominal fee harus berupa angka yang valid.')
      return
    }
    setSavingId(material.id)
    setError('')
    const response = await fetch('/api/admin/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: material.id, amount, note: notes[material.id] || '' }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Fee gagal disimpan.')
    else await load()
    setSavingId(null)
  }

  const pay = async (material: FeeMaterial, file: File | null) => {
    if (!file || !material.fee || material.fee.status !== 'payable') return
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Bukti transfer harus PDF, JPG, atau PNG maksimal 5 MB.')
      return
    }
    setPayingId(material.id)
    setError('')
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    const fileHash = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
    const extension = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg'
    const storagePath = `payouts/${material.asatidzId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('financial-proofs').upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) {
      setError(uploadError.message)
      setPayingId(null)
      return
    }

    const response = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeId: material.fee.id, storagePath, fileHash }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      await supabase.storage.from('financial-proofs').remove([storagePath])
      setError(payload?.error || 'Payout gagal dicatat.')
    } else {
      await load()
    }
    setPayingId(null)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Keuangan Asatidz</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Fee Materi</h1><p className="mt-2 text-sm text-white/65">Tetapkan fee untuk setiap materi yang sudah dipublikasikan.</p></div>
          <div className="rounded-2xl bg-white/10 px-5 py-3"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Belum diberi fee</p><p className="mt-1 text-2xl font-black">{withoutFee}</p></div>
        </div>
      </section>

      {error && <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3"><Banknote className="text-emerald-700" /><h2 className="text-lg font-black text-slate-900">Materi Terbit</h2></div>
        {loading ? <div className="grid h-60 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : materials.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Belum ada materi yang dipublikasikan.</p> : (
          <div className="mt-5 space-y-4">
            {materials.map((material) => (
              <article key={material.id} className={`rounded-2xl border p-4 sm:p-5 ${material.fee ? 'border-emerald-100 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div><div className="flex items-center gap-2"><h3 className="font-black text-slate-900">{material.title}</h3>{material.fee && <CheckCircle2 size={17} className="text-emerald-600" />}</div><p className="mt-1 text-sm text-slate-500">{material.asatidzName} · {material.publishedAt ? new Date(material.publishedAt).toLocaleDateString('id-ID') : '-'}</p></div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${material.fee ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{material.fee ? material.fee.status : 'Belum ada fee'}</span>
                    {material.fee?.status === 'payable' && (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                        {payingId === material.id ? <LoaderCircle className="animate-spin" size={15} /> : <Upload size={15} />}
                        {payingId === material.id ? 'Memproses...' : 'Unggah bukti transfer'}
                        <input type="file" className="sr-only" disabled={payingId !== null} accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => void pay(material, event.target.files?.[0] ?? null)} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto]">
                  <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Nominal (Rp)</span><input type="number" min={0} value={amounts[material.id] ?? ''} onChange={(event) => setAmounts({ ...amounts, [material.id]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" /></label>
                  <label><span className="text-xs font-black uppercase tracking-wider text-slate-500">Catatan</span><input value={notes[material.id] ?? ''} onChange={(event) => setNotes({ ...notes, [material.id]: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3" /></label>
                  <button type="button" onClick={() => void save(material)} disabled={savingId === material.id} className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 text-sm font-black text-white disabled:opacity-50">{savingId === material.id ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />} Simpan</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
