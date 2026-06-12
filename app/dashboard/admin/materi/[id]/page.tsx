import { requireRole } from '@/lib/helpers/auth'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DetailMateriClient from './detailmatericlient'

export default async function DetailMateriPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Proteksi Admin
  await requireRole('admin')
  const { id } = await params

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Mengambil data riil materi, profil asatidz, dan nama keilmuan terkait
  const { data: material, error } = await supabaseAdmin
    .from('materials')
    .select(`
      id,
      type,
      keilmuan_id,
      title,
      slug,
      description,
      summary,
      youtube_url,
      thumbnail_url,
      asatidz_id,
      is_published,
      created_at,
      updated_at,
      profiles!materials_asatidz_id_fkey ( nama, email ),
      keilmuan ( nama )
    `)
    .eq('id', id)
    .single()

  if (error || !material) return notFound()

  // Normalisasi bentuk objek untuk menghidupkan UI
  const keilmuanData = Array.isArray(material.keilmuan) ? material.keilmuan[0] : material.keilmuan
  
  // FIX: Menghapus baris 'material.status' yang menyebabkan error TypeScript 2339
  const mappedStatus = material.is_published ? 'approved' : 'pending' 

  const formattedMateri = {
    ...material,
    status: mappedStatus, // Menggunakan hasil mapping dari flag is_published
    kategori_nama: keilmuanData?.nama || 'Kajian Umum',
    judul: material.title,
    deskripsi: material.description || material.summary
  }

  return <DetailMateriClient materi={formattedMateri} />
}