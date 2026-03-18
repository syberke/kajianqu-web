
import { createClient } from '@/supabase/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, email, foto_url, role')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  return (
    <>
      <PublicNavbar userProfile={userProfile} />
      
      <main>
        {children}
      </main>
      
      <PublicFooter />
    </>
  )
}