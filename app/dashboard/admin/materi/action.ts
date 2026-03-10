'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function updateStatusMateri(materiId: string, status: 'approved' | 'rejected', catatan: string) {
  const { error } = await supabaseAdmin
    .from('materials')
    .update({ 
      status: status,
      catatan_reviewer: catatan 
    })
    .eq('id', materiId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/materi')
  return { success: true }
}