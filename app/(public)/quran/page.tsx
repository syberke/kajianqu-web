import { createClient } from '@/lib/supabase/server'
import QuranClient from './QuranClient'

export default async function QuranPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    userProfile = data
  }

  return <QuranClient userProfile={userProfile} />
}