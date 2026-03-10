import { requireRole } from '@/lib/helpers/auth'
import Link from 'next/link'

export default async function DashboardAsatidzPage() {
  const { profile } = await requireRole('asatidz')

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p>Assalamu&apos;alaikum, {profile.nama}</p>
      <div className="flex flex-wrap gap-3">
        <Link className="border rounded px-4 py-2" href="/dashboard/asatidz/materi">Kelola Materi</Link>
        <Link className="border rounded px-4 py-2" href="/dashboard/asatidz/live">Kelola Live</Link>
        <Link className="border rounded px-4 py-2" href="/logout">Logout</Link>
      </div>
    </main>
  )
}