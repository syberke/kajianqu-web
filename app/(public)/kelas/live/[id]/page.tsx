// app/kelas/[type]/[id]/page.tsx
// Halaman detail kelas — sesuai screenshot 4 (Live Stream detail) dan 5 (Kajian Tematik detail)
// type: 'live' | 'tematik'
// Breadcrumb, judul, video player, tombol Tonton + Bagikan
// "Temukan Kajian Lainnya" — grid 3x2 card

import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import KelasDetailClient from './KelasDetailClient'

interface Props {
  params: Promise<{ type: string; id: string }>
}

export default async function KelasDetailPage({ params }: Props) {
  const { type, id } = await params
  const supabase = await createClient()

  let item: any = null
  let relatedItems: any[] = []

  if (type === 'live') {
    const { data } = await supabase
      .from('live_sessions')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .eq('id', id)
      .single()
    item = data

    // Related: live sessions lainnya
    const { data: related } = await supabase
      .from('live_sessions')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .neq('id', id)
      .limit(6)
    relatedItems = related ?? []

  } else if (type === 'tematik') {
    const { data } = await supabase
      .from('materials')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .eq('id', id)
      .eq('type', 'kajian_tematik')
      .single()
    item = data

    // Related: materi tematik lainnya
    const { data: related } = await supabase
      .from('materials')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .eq('type', 'kajian_tematik')
      .eq('is_published', true)
      .neq('id', id)
      .limit(6)
    relatedItems = related ?? []
  }

  if (!item) {
    // Kalau tidak ditemukan, gunakan dummy data agar halaman tetap render
    item = {
      id, title: 'Hukumnya Tahlilan Bersama Ust. Adi Hidayat',
      description: 'Tahlilan merupakan salah satu tradisi keagamaan yang sudah lama hidup dan berkembang di tengah masyarakat Muslim Indonesia.',
      youtube_url: null,
      stream_url: null,
      asatidz: { nama: 'Ust. Adi Hidayat' },
      status: 'upcoming',
    }
    relatedItems = Array(6).fill({
      id: 'dummy', title: 'Hukumnya Tahlilan', description: 'Membahas Seputar Tahlilan, dan pertan...', asatidz: { nama: 'Ust. Adi Hidayat' }
    })
  }

  return (
    <KelasDetailClient
      item={item}
      type={type as 'live' | 'tematik'}
      relatedItems={relatedItems}
    />
  )
}