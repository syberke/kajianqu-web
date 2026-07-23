'use client'

import { usePathname } from 'next/navigation'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'

interface UserProfile {
  nama?: string
  email?: string
  foto_url?: string
  role?: string
}
export default function PublicShell({
  children,
  userProfile,
}: {
  children: React.ReactNode
  userProfile?: UserProfile | null
}) {
  const pathname = usePathname()

  // WelcomeClient has its own transparent navigation and long-form footer.
  if (pathname === '/welcome') return <>{children}</>

  return (
    <>
      <PublicNavbar userProfile={userProfile} />
      <main>{children}</main>
      <PublicFooter />
    </>
  )
}
