'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateStatusDonasi(
  donasiId: string, 
  status: 'success' | 'failed', // Sesuai pilihan di UI
  catatan?: string
) {
  const { error } = await supabaseAdmin
    .from('donations') // Pastikan nama tabelnya 'donations'
    .update({ 
      payment_status: status, // Sesuai kolom database kamu
      note: catatan || null,   // Sesuai kolom database kamu
      updated_at: new Date().toISOString()
    })
    .eq('id', donasiId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/donasi')
  revalidatePath(`/dashboard/admin/donasi/${donasiId}`)
  
  return { success: true }
}