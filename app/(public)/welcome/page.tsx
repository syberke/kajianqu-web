// app/welcome/page.tsx
// Server component — cek apakah user sudah login
// Kirim userProfile ke WelcomeClient, kalau null berarti belum login

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

  // Kirim ke client — kalau userProfile null = belum login
  return <WelcomeClient userProfile={userProfile} />
}