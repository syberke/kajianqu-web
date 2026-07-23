import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getDonationProofAccessUrl(path: string | null) {
  if (!path) return null
  if (/^https:\/\//i.test(path)) return path

  const { data, error } = await createAdminClient()
    .storage
    .from('donation-proofs')
    .createSignedUrl(path, 60 * 10)

  if (error) return null
  return data.signedUrl
}
