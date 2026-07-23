import { requireAuth } from '@/lib/helpers/auth'
import { redirect } from 'next/navigation'

export default async function ProfileRedirectPage() {
  const { profile } = await requireAuth()

  if (profile?.role === 'admin') redirect('/dashboard/admin/settings')
  if (profile?.role === 'asatidz') redirect('/dashboard/asatidz/profile')
  redirect('/dashboard/siswa/profile')
}
