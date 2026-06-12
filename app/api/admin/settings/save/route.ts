import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const settings = [
      {
        key: 'donation_target',
        value: String(formData.get('donation_target') || '')
      },
      {
        key: 'support_whatsapp',
        value: String(formData.get('support_whatsapp') || '')
      },
      {
        key: 'support_email',
        value: String(formData.get('support_email') || '')
      },
      {
        key: 'asatidz_registration',
        value: String(formData.get('asatidz_registration') || 'true')
      },
      {
        key: 'donation_enabled',
        value: String(formData.get('donation_enabled') || 'true')
      },
      {
        key: 'maintenance_mode',
        value: String(formData.get('maintenance_mode') || 'false')
      }
    ]

    for (const setting of settings) {
      const { data: existing } = await supabaseAdmin
        .from('settings')
        .select('id')
        .eq('key', setting.key)
        .single()

      if (existing) {
        await supabaseAdmin
          .from('settings')
          .update({
            value: setting.value,
            updated_at: new Date().toISOString()
          })
          .eq('key', setting.key)
      } else {
        await supabaseAdmin
          .from('settings')
          .insert({
            key: setting.key,
            value: setting.value
          })
      }
    }

    await supabaseAdmin
      .from('activity_logs')
      .insert({
        type: 'system',
        title: 'Pengaturan Diperbarui',
        description: 'Admin mengubah konfigurasi sistem',
        status: 'success'
      })

    return NextResponse.redirect(
      new URL('/dashboard/admin/settings?success=true', request.url)
    )
  } catch (error) {
    console.error(error)

    return NextResponse.redirect(
      new URL('/dashboard/admin/settings?error=true', request.url)
    )
  }
}