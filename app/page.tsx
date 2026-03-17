// app/page.tsx atau app/welcome/page.tsx

import { createClient } from '@/supabase/server'
import WelcomeClient from '../app/(public)/welcome/WelcomeClient'

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