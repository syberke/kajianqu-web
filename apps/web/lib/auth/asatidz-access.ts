import { cache } from 'react'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export const getAsatidzAccount = cache(async () => {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      nama: true,
      email: true,
      fotoUrl: true,
      role: true,
      isActive: true,
      asatidzProfile: {
        select: {
          approved: true,
          status: true,
          asatidzCode: true,
          reviewNote: true,
          submittedAt: true,
        },
      },
    },
  })

  if (!profile || profile.role !== 'asatidz' || !profile.isActive) return null

  return {
    user,
    profile,
    access: {
      approved: profile.asatidzProfile?.approved === true
        && profile.asatidzProfile.status === 'APPROVED',
      status: profile.asatidzProfile?.status ?? 'PENDING_PROFILE',
      asatidzCode: profile.asatidzProfile?.asatidzCode ?? null,
      reviewNote: profile.asatidzProfile?.reviewNote ?? null,
      submittedAt: profile.asatidzProfile?.submittedAt?.toISOString() ?? null,
    },
  }
})
