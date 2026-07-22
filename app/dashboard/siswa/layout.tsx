import { requireRole } from '@/lib/helpers/auth'
import StudentLayoutClient from './StudentLayoutClient'

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('siswa')
  return <StudentLayoutClient profile={profile ? { nama: profile.nama, foto_url: profile.foto_url } : null}>{children}</StudentLayoutClient>
}
