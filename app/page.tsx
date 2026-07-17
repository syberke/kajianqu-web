import WelcomeClient from './(public)/welcome/WelcomeClient'
import { getCurrentUserProfile } from '@/lib/helpers/auth'

export default async function HomePage() {
  const result = await getCurrentUserProfile()
  const profile = result?.profile

  return (
    <WelcomeClient
      userProfile={
        profile
          ? {
              nama: profile.nama ?? undefined,
              email: profile.email ?? undefined,
              foto_url: profile.foto_url ?? undefined,
              role: profile.role ?? undefined,
            }
          : null
      }
    />
  )
}
