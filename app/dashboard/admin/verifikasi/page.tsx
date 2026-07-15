import UserTable, { type User } from './VerifikasiTable'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function ManageVerifikasiPage() {
  await requireRole('admin')

  const [users, donationAggregate, logs] = await Promise.all([
    db.profile.findMany({
      where: { role: 'asatidz' },
      orderBy: { createdAt: 'desc' },
      include: { asatidzProfile: true },
    }),
    db.donation.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { nominal: true },
    }),
    db.activityLog.findMany({
      where: { type: 'asatidz' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const formattedUsers: User[] = users.map((user) => ({
    id: user.id,
    nama: user.nama || 'Asatidz KajianQu',
    email: user.email || '',
    role: user.role || 'asatidz',
    no_wa: user.noWa || '',
    created_at: user.createdAt.toISOString(),
    asatidz_profiles: user.asatidzProfile
      ? {
          bidang: user.asatidzProfile.bidang || '-',
          latar_belakang: user.asatidzProfile.latarBelakang || '-',
          approved: user.asatidzProfile.approved,
        }
      : null,
  }))

  const recentLogs = logs.map((log) => ({
    id: log.id,
    title: log.title,
    description: log.description,
    status: log.status,
    created_at: log.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Asatidz</h1>
        <p className="mt-1 text-sm text-gray-500">Verifikasi aplikasi baru dan kelola pendaftaran Asatidz yang sudah ada.</p>
      </div>
      <UserTable
        initialUsers={formattedUsers}
        totalDonations={donationAggregate._sum.nominal?.toNumber() ?? 0}
        recentLogs={recentLogs}
      />
    </div>
  )
}
