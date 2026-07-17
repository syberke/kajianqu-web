import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

const SETTING_KEYS = [
  'donation_target',
  'support_whatsapp',
  'support_email',
  'asatidz_registration',
  'donation_enabled',
  'maintenance_mode',
] as const

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const formData = await request.formData()
    const settings = SETTING_KEYS.map((key) => ({
      key,
      value: String(formData.get(key) ?? (key.includes('enabled') || key.includes('registration') ? 'true' : key === 'maintenance_mode' ? 'false' : '')),
    }))

    await db.$transaction([
      ...settings.map((setting) =>
        db.setting.upsert({
          where: { key: setting.key },
          create: setting,
          update: { value: setting.value },
        }),
      ),
      db.activityLog.create({
        data: {
          type: 'system',
          title: 'Pengaturan Diperbarui',
          description: `Admin ${admin.email ?? admin.id} mengubah konfigurasi sistem`,
          status: 'success',
        },
      }),
    ])

    return NextResponse.redirect(new URL('/dashboard/admin/settings?success=true', request.url))
  } catch (error) {
    console.error('Failed to save settings', error)
    return NextResponse.redirect(new URL('/dashboard/admin/settings?error=true', request.url))
  }
}
