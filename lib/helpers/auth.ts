import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
      asatidzProfile: { select: { approved: true } },
    },
  })

  return {
    user,
    profile: profile
      ? {
          id: profile.id,
          nama: profile.nama,
          email: profile.email,
          foto_url: profile.fotoUrl,
          role: profile.role,
          isActive: profile.isActive,
          asatidzApproved: profile.asatidzProfile?.approved ?? false,
        }
      : null,
  }
}

export async function requireAuth() {
  const result = await getCurrentUserProfile()
  if (!result?.user) redirect('/login')
  return result
}

export async function requireRole(role: 'siswa' | 'asatidz' | 'admin') {
  const result = await requireAuth()

  const permitted = result.profile?.isActive
    && result.profile.role === role
    && (role !== 'asatidz' || result.profile.asatidzApproved)
  if (permitted) return result

  if (!result.profile?.isActive || (result.profile.role === 'asatidz' && !result.profile.asatidzApproved)) {
    redirect('/welcome?access=pending')
  }

  const roleRedirects: Record<string, string> = {
    admin: '/dashboard/admin',
    asatidz: '/dashboard/asatidz',
    siswa: '/dashboard/siswa',
  }

  const destination = roleRedirects[result.profile?.role ?? ''] ?? '/login'
  redirect(destination)
}
