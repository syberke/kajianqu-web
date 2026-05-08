import { createClient } from '@/lib/supabase/server'
import WelcomeClient from './(public)/welcome/WelcomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, email, foto_url, role')
      .eq('id', user.id)
      .single()

    userProfile = profile
  }

  return <WelcomeClient userProfile={userProfile} />
}