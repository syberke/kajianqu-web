import PublicShell from '@/components/layout/PublicShell'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userProfile } = user
    ? await supabase
        .from('profiles')
        .select('nama, email, foto_url, role')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const normalizedProfile = userProfile
    ? {
        nama: userProfile.nama ?? undefined,
        email: userProfile.email ?? undefined,
        foto_url: userProfile.foto_url ?? undefined,
        role: userProfile.role ?? undefined,
      }
    : null

  return <PublicShell userProfile={normalizedProfile}>{children}</PublicShell>
}
