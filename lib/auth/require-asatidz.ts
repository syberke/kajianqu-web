import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth/require-admin'

export async function requireAsatidz() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  return profile?.role === 'asatidz' || profile?.role === 'admin' ? user : null
}
