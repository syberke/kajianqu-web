import { requireRole } from '@/lib/helpers/auth'
import AdminLayoutClient from './AdminLayoutClient'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin')
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
