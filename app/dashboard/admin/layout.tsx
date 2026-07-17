import { requireRole } from '@/lib/helpers/auth'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin')
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
