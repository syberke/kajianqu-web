import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/helpers/auth'

export default async function ChatAliasPage() {
  const { profile } = await requireAuth()
  if (profile?.role === 'asatidz') redirect('/dashboard/asatidz/chat')
  redirect('/dashboard/siswa/chat')
}
