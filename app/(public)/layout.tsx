import PublicShell from '@/components/layout/PublicShell'
import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userProfile = user
    ? await db.profile.findUnique({
        where: { id: user.id },
        select: { nama: true, email: true, fotoUrl: true, role: true },
      })
    : null

  const normalizedProfile = userProfile
    ? {
        nama: userProfile.nama ?? undefined,
        email: userProfile.email ?? undefined,
        foto_url: userProfile.fotoUrl ?? undefined,
        role: userProfile.role ?? undefined,
      }
    : null

  return <PublicShell userProfile={normalizedProfile}>{children}</PublicShell>
}
