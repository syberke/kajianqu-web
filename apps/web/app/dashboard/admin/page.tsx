import Link from 'next/link'
import { BookOpen, Radio, ShieldCheck, Users, Wallet } from 'lucide-react'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function AdminDashboardPage() {
  const { profile } = await requireRole('admin')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 6)

  const [asatidzCount, pendingCount, donations, liveCount, latestDonations, activity, targetSetting] = await Promise.all([
    db.profile.count({ where: { role: 'asatidz' } }),
    db.asatidzProfile.count({ where: { approved: false } }),
    db.donation.findMany({
      where: { paymentStatus: 'paid' },
      select: { nominal: true, createdAt: true },
    }),
    db.liveSession.count({ where: { status: { in: ['live', 'upcoming'] } } }),
    db.donation.findMany({
      where: { paymentStatus: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    db.setting.findUnique({ where: { key: 'donation_target' }, select: { value: true } }),
  ])

  const donationTotal = donations.reduce((sum, item) => sum + item.nominal.toNumber(), 0)
  const todayTotal = donations
    .filter((item) => item.createdAt >= today)
    .reduce((sum, item) => sum + item.nominal.toNumber(), 0)
  const weekTotal = donations
    .filter((item) => item.createdAt >= weekStart)
    .reduce((sum, item) => sum + item.nominal.toNumber(), 0)
  const target = Number(targetSetting?.value ?? 0)
  const firstName = profile?.nama?.trim().split(/\s+/)[0] || 'Admin'

  const cards = [
    { label: 'Asatidz', value: asatidzCount, icon: Users },
    { label: 'Menunggu Verifikasi', value: pendingCount, icon: ShieldCheck },
    { label: 'Live Aktif/Mendatang', value: liveCount, icon: Radio },
    { label: 'Donasi Terverifikasi', value: `Rp ${donationTotal.toLocaleString('id-ID')}`, icon: Wallet },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Admin KajianQu</p>
        <h1 className="mt-2 text-3xl font-black">Selamat Datang, {firstName}</h1>
        <p className="mt-2 text-sm text-white/65">Semua angka di bawah dihitung dari database melalui Prisma.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon size={19} /></span>
            <p className="mt-4 text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Aktivitas Terbaru</h2>
          <p className="mt-1 text-sm text-slate-500">Log aksi admin dan sistem.</p>
          {activity.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Belum ada aktivitas.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {activity.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{item.createdAt.toLocaleString('id-ID')}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900">Donasi</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Hari ini</dt><dd className="font-bold text-slate-900">Rp {todayTotal.toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">7 hari</dt><dd className="font-bold text-slate-900">Rp {weekTotal.toLocaleString('id-ID')}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Target</dt><dd className="font-bold text-slate-900">Rp {target.toLocaleString('id-ID')}</dd></div>
            </dl>
            <Link href="/dashboard/admin/donasi" className="mt-5 inline-flex font-bold text-emerald-700 hover:underline">Kelola donasi</Link>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900">Donasi Terbaru</h2>
            {latestDonations.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Belum ada donasi terverifikasi.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {latestDonations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-600">{item.donorName || 'Hamba Allah'}</span>
                    <span className="font-bold text-slate-900">Rp {item.nominal.toNumber().toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/admin/verifikasi" className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm"><ShieldCheck className="mb-3 text-emerald-700" />Verifikasi Asatidz</Link>
        <Link href="/dashboard/admin/materi" className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm"><BookOpen className="mb-3 text-emerald-700" />Tinjau Materi</Link>
        <Link href="/dashboard/admin/reports" className="rounded-2xl border border-slate-200 bg-white p-5 font-bold text-slate-800 shadow-sm"><Wallet className="mb-3 text-emerald-700" />Buka Reports</Link>
      </div>
    </div>
  )
}
