import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true },
  })

  return profile?.role === 'admin' && profile.isActive ? user : null
}
