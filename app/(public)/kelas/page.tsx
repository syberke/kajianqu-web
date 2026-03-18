// app/kelas/page.tsx
// Halaman publik daftar kelas — sesuai screenshot
// Tab: Live Stream | Kajian Tematik | Kelas Private
// Data dari Supabase

import { createClient } from '@/supabase/server'
import KelasClient from './KelasClient'

export default async function KelasPage() {
  const supabase = await createClient()

  // Fetch semua data paralel
  const [liveRes, tematikRes] = await Promise.all([
    supabase
      .from('live_sessions')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .in('status', ['live', 'upcoming', 'ended'])
      .order('scheduled_at', { ascending: false }),

    supabase
      .from('materials')
      .select('*, asatidz:asatidz_id(nama, foto_url)')
      .eq('type', 'kajian_tematik')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  // Data Kelas Private — static sesuai design (bisa diganti dari DB kalau ada)
  const privateData = {
    description: 'adalah program pembelajaran eksklusif dengan pendampingan langsung dari mentor berpengalaman. Setiap sesi dirancang lebih fokus dan terarah, sehingga materi dapat dipahami secara mendalam sesuai kebutuhan dan target belajar masing-masing peserta.',
    mentors: [
      { nama: 'Ust. Adi Hidayat', bidang: 'Kajian Fiqih' },
      { nama: 'Ust. Solihin',     bidang: 'Kajian Akhlak' },
      { nama: 'Ust. Abdul Somad', bidang: 'Kajian Tafsir' },
      { nama: 'Ust. Ahmad Dahlan', bidang: 'Kajian Tafsir' },
    ],
    keunggulan: [
      { icon: '📖', title: 'Materi Lengkap',      desc: 'Mulai dari pengenalan huruf hingga pendalaman tajwid tersedia disini.' },
      { icon: '🤖', title: 'Koreksi Ai',           desc: 'Mulai dari pengenalan huruf hingga pendalaman tajwid tersedia disini.' },
      { icon: '✅', title: 'Ustadz Profesional',   desc: 'Mulai dari pengenalan huruf hingga pendalaman tajwid tersedia disini.' },
      { icon: '🆓', title: 'Gratis',              desc: 'Mulai dari pengenalan huruf hingga pendalaman tajwid tersedia disini.' },
    ],
  }

  return (
    <KelasClient
      liveData={liveRes.data ?? []}
      tematikData={tematikRes.data ?? []}
      privateData={privateData}
    />
  )
}