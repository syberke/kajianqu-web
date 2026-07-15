import { requireRole } from '@/lib/helpers/auth'
import AsatidzLayoutClient from './AsatidzLayoutClient'

export default async function AsatidzLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('asatidz')

  return (
    <AsatidzLayoutClient
      profile={
        profile
          ? {
              id: profile.id,
              nama: profile.nama ?? undefined,
              email: profile.email ?? undefined,
              foto_url: profile.foto_url ?? undefined,
              role: profile.role ?? undefined,
            }
          : null
      }
    >
      {children}
    </AsatidzLayoutClient>
  )
}
