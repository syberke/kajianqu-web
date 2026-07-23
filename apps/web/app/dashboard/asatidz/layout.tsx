import { redirect } from 'next/navigation'

import { getAsatidzAccount } from '@/lib/auth/asatidz-access'
import AsatidzLayoutClient from './AsatidzLayoutClient'

export const dynamic = 'force-dynamic'

export default async function AsatidzLayout({ children }: { children: React.ReactNode }) {
  const account = await getAsatidzAccount()
  if (!account) redirect('/login')

  return (
    <AsatidzLayoutClient
      profile={
        {
          id: account.profile.id,
          nama: account.profile.nama,
          email: account.profile.email,
          foto_url: account.profile.fotoUrl ?? undefined,
          role: account.profile.role,
        }
      }
      access={account.access}
    >
      {children}
    </AsatidzLayoutClient>
  )
}
