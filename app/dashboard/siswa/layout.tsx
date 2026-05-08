import { requireRole } from '@/lib/helpers/auth'
import { redirect } from 'next/navigation'

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('siswa')
  // Siswa tidak punya dashboard — redirect ke welcome/home
  return <>{children}</>
}