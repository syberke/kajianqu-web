'use client'

import { supabase } from '@/lib/supabase/client'

export async function uploadDonationProof(file: File, userId: string): Promise<string> {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
  if (!allowedTypes.has(file.type)) throw new Error('Bukti harus berupa JPG, PNG, WebP, atau PDF.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran bukti maksimal 10 MB.')

  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  }
  const path = `${userId}/${crypto.randomUUID()}.${extensions[file.type]}`
  const { error } = await supabase.storage.from('donation-proofs').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return path
}
