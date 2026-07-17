'use client'

import { supabase } from '@/lib/supabase/client'

export async function uploadDonationProof(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('donations').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('donations').getPublicUrl(path)
  return data.publicUrl
}
