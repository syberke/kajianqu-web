import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

interface ProfilePatch {
  nama?: string
  noWa?: string
  bank?: string
  noRekening?: string
  bidang?: string
}

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    include: { asatidzProfile: true },
  })

  if (!profile) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

  return NextResponse.json({
    profile: {
      id: profile.id,
      nama: profile.nama,
      email: profile.email,
      fotoUrl: profile.fotoUrl,
      noWa: profile.noWa,
      bank: profile.asatidzProfile?.bank ?? null,
      noRekening: profile.asatidzProfile?.noRekening ?? null,
      role: profile.role,
      bidang: profile.asatidzProfile?.bidang ?? null,
    },
  })
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = (await request.json().catch(() => null)) as ProfilePatch | null
  if (!payload) return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })

  const clean = (value?: string) => (typeof value === 'string' ? value.trim() : undefined)
  const nama = clean(payload.nama)
  if (payload.nama !== undefined && !nama) {
    return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
  }

  const current = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!current) return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 })

  const profile = await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: user.id },
      data: {
        ...(nama !== undefined ? { nama } : {}),
        ...(payload.noWa !== undefined ? { noWa: clean(payload.noWa) || null } : {}),
      },
    })

    if (current.role === 'asatidz' || current.role === 'admin') {
      await tx.asatidzProfile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          bidang: clean(payload.bidang) || null,
          bank: clean(payload.bank) || null,
          noRekening: clean(payload.noRekening) || null,
        },
        update: {
          ...(payload.bidang !== undefined ? { bidang: clean(payload.bidang) || null } : {}),
          ...(payload.bank !== undefined ? { bank: clean(payload.bank) || null } : {}),
          ...(payload.noRekening !== undefined ? { noRekening: clean(payload.noRekening) || null } : {}),
        },
      })
    }

    return tx.profile.findUnique({
      where: { id: user.id },
      include: { asatidzProfile: true },
    })
  })

  return NextResponse.json({
    profile: profile
      ? {
          id: profile.id,
          nama: profile.nama,
          email: profile.email,
          fotoUrl: profile.fotoUrl,
          noWa: profile.noWa,
          bank: profile.asatidzProfile?.bank ?? null,
          noRekening: profile.asatidzProfile?.noRekening ?? null,
          role: profile.role,
          bidang: profile.asatidzProfile?.bidang ?? null,
        }
      : null,
  })
}
