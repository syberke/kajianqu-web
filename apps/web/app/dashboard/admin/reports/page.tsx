import { BookOpen, Download, Radio, Users, Wallet } from 'lucide-react'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function ReportsPage() {
  await requireRole('admin')

  const [totalAsatidz, totalMateri, totalLive, donationAggregate, totalUsers] = await Promise.all([
    db.profile.count({ where: { role: 'asatidz' } }),
    db.material.count(),
    db.liveSession.count(),
    db.donation.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { nominal: true },
    }),
    db.profile.count(),
  ])

  const totalDonasi = donationAggregate._sum.nominal?.toNumber() ?? 0
  const reports = [
    { title: 'User', value: totalUsers, icon: <Users />, href: '/api/admin/reports/users', label: 'Export User' },
    { title: 'Asatidz', value: totalAsatidz, icon: <Users />, href: '/api/admin/reports/asatidz', label: 'Export Asatidz' },
    { title: 'Total Donasi', value: `Rp ${totalDonasi.toLocaleString('id-ID')}`, icon: <Wallet />, href: '/api/admin/reports/donasi', label: 'Export Donasi' },
    { title: 'Materi', value: totalMateri, icon: <BookOpen />, href: '/api/admin/reports/materi', label: 'Export Materi' },
    { title: 'Live Session', value: totalLive, icon: <Radio />, href: '/api/admin/reports/live', label: 'Export Live' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Sistem</h1>
        <p className="text-gray-500">Ringkasan seluruh aktivitas KajianQu dari query Prisma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {reports.map((report) => (
          <ReportCard key={report.title} icon={report.icon} title={report.title} value={report.value} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {reports.map((report) => (
          <a key={report.href} href={report.href} className="flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800">
            <Download size={17} /> {report.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function ReportCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-3 text-emerald-700">{icon}</div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-1 text-2xl font-bold">{value}</h2>
    </div>
  )
}
