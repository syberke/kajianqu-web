import { requireRole } from '@/lib/helpers/auth'
import AsatidzLayoutClient from './AsatidzLayoutClient'

export default async function AsatidzLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('asatidz')
  return <AsatidzLayoutClient profile={profile}>{children}</AsatidzLayoutClient>
}