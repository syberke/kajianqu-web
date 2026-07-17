import { requireAuth } from '@/lib/helpers/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirectPage() {
  const { profile } = await requireAuth()

  if (profile?.role === 'admin') redirect('/dashboard/admin')
  if (profile?.role === 'asatidz') redirect('/dashboard/asatidz')
  redirect('/welcome')
}
