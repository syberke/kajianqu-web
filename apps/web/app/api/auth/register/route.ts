import { NextResponse } from 'next/server'
import { z } from 'zod'

import { checkRateLimit, requestIdentity } from '@/lib/security/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

const registrationSchema = z.object({
  role: z.enum(['siswa', 'asatidz']),
  nama: z.string().trim().min(2).max(120),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  no_wa: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,18}$/),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  const rate = checkRateLimit(`register:${requestIdentity(request)}`, 5, 60 * 60 * 1_000)
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.' }, {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    })
  }

  const parsed = registrationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Data pendaftaran belum lengkap atau tidak valid.' }, { status: 400 })
  const payload = parsed.data

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: false,
    user_metadata: { nama: payload.nama, role: payload.role },
  })
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || 'Gagal membuat akun.' }, { status: 400 })
  }

  const userId = data.user.id
  try {
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      role: payload.role,
      nama: payload.nama,
      email: payload.email,
      no_wa: payload.no_wa,
      is_active: true,
    })
    if (profileError) throw profileError

    if (payload.role === 'asatidz') {
      const { error: asatidzError } = await admin.from('asatidz_profiles').upsert({
        id: userId,
        approved: false,
        status: 'PENDING_PROFILE',
      })
      if (asatidzError) throw asatidzError
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/auth/callback`
    await admin.auth.resend({ type: 'signup', email: payload.email, options: { emailRedirectTo: redirectTo } })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (cause) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Gagal menyimpan profil.' }, { status: 500 })
  }
}
