import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth/require-admin'

export async function requireAsatidz() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true, asatidzProfile: { select: { approved: true } } },
  })

  if (!profile?.isActive) return null
  if (profile.role === 'admin') return user
  return profile.role === 'asatidz' && profile.asatidzProfile?.approved ? user : null
}
