// app/(public)/materi/page.tsx
// Halaman daftar keilmuan — sesuai screenshot 1
// Navbar & footer dari (public)/layout.tsx — tidak perlu import di sini

import { createClient } from '@/supabase/server'
import MateriClient from './KeilmuanClient'

export default async function MateriPage() {
  const supabase = await createClient()

  // Fetch materi dan kategori keilmuan paralel
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