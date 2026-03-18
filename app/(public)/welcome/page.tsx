
import { createClient } from '@/supabase/server'
import WelcomeClient from './WelcomeClient'

export default async function WelcomePage() {
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

  return <WelcomeClient userProfile={userProfile} />
}