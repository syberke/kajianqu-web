import { Banknote, CheckCircle2, Clock3, ExternalLink, WalletCards } from 'lucide-react'

import { getAsatidzAccount } from '@/lib/auth/asatidz-access'
import { db } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AsatidzEarningsPage() {
  const account = await getAsatidzAccount()
  if (!account?.access.approved) return null

  const [fees, payouts] = await Promise.all([
    db.fee.findMany({
      where: { asatidzId: account.user.id },
      orderBy: { createdAt: 'desc' },
      include: { material: { select: { title: true } } },
    }),
    db.payout.findMany({
      where: { asatidzId: account.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { proofs: { take: 1, orderBy: { uploadedAt: 'desc' } } },
    }),
  ])
  const storage = createAdminClient().storage.from('financial-proofs')
  const payoutRows = await Promise.all(payouts.map(async (payout) => {
    const proof = payout.proofs[0]
    if (!proof) return { ...payout, proofUrl: null }
    const { data } = await storage.createSignedUrl(proof.storagePath, 60 * 10)
    return { ...payout, proofUrl: data?.signedUrl ?? null }
  }))
  const total = fees.reduce((sum, fee) => sum + Number(fee.amount), 0)
  const paid = fees.filter((fee) => fee.status === 'paid').reduce((sum, fee) => sum + Number(fee.amount), 0)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Keuangan Asatidz</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Fee & Pendapatan</h1>
        <p className="mt-2 text-sm text-white/65">Nominal berasal dari keputusan admin untuk materi yang telah diterbitkan.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total Fee" value={currency(total)} icon={<WalletCards />} />
        <Stat label="Sudah Dibayar" value={currency(paid)} icon={<CheckCircle2 />} />
        <Stat label="Menunggu Bayar" value={currency(Math.max(0, total - paid))} icon={<Clock3 />} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3"><Banknote className="text-emerald-700" /><h2 className="text-lg font-black text-slate-900">Rincian Fee Materi</h2></div>
        {fees.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Belum ada fee materi.</p> : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400"><th className="pb-3">Materi</th><th className="pb-3">Tanggal</th><th className="pb-3">Status</th><th className="pb-3 text-right">Nominal</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{fees.map((fee) => <tr key={fee.id}><td className="py-4 font-bold text-slate-800">{fee.material.title}<p className="mt-1 text-xs font-normal text-slate-400">{fee.note || 'Tanpa catatan'}</p></td><td className="py-4 text-slate-500">{fee.createdAt.toLocaleDateString('id-ID')}</td><td className="py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{fee.status}</span></td><td className="py-4 text-right font-black text-slate-900">{currency(Number(fee.amount))}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-black text-slate-900">Riwayat Payout</h2>
        {payoutRows.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-500">Belum ada transfer payout.</p> : <div className="mt-4 space-y-3">{payoutRows.map((payout) => <div key={payout.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"><div><p className="font-black text-slate-800">{currency(Number(payout.totalAmount))}</p><p className="text-xs text-slate-400">{payout.createdAt.toLocaleString('id-ID')}</p></div><div className="flex flex-wrap items-center gap-2"><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{payout.status}</span>{payout.proofUrl && <a href={payout.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Bukti transfer <ExternalLink size={14} /></a>}</div></div>)}</div>}
      </section>
    </div>
  )
}

function currency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span><p className="mt-4 text-xl font-black text-emerald-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>
}
