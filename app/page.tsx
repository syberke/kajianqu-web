import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/welcome')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'siswa') redirect('/dashboard/siswa')
  if (profile?.role === 'asatidz') redirect('/dashboard/asatidz')
  if (profile?.role === 'admin') redirect('/dashboard/admin')

  redirect('/welcome')
}