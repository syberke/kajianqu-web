import { createClient } from '@/supabase/server'
import MateriClient from './MateriClient'

export default async function MateriPage() {
  const supabase = await createClient()

  const [materiRes, keilmuanRes] = await Promise.all([
    supabase
      .from('materials')
      .select('*, keilmuan:keilmuan_id(id, nama), asatidz:asatidz_id(nama, foto_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),

    supabase
      .from('keilmuan')
      .select('id, nama')
      .eq('is_active', true)
      .order('nama'),
  ])

  return (
    <MateriClient
      initialMaterials={materiRes.data ?? []}
      keilmuanList={keilmuanRes.data ?? []}
    />
  )
}