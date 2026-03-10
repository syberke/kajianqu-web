import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

export async function requireAuth() {
  const result = await getCurrentUserProfile()
  if (!result?.user) redirect('/login')
  return result
}

export async function requireRole(role: 'siswa' | 'asatidz' | 'admin') {
  const result = await requireAuth()
  if (result.profile?.role !== role) {
    redirect('/login')
  }
  return result
}