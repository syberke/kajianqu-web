// app/(public)/materi/[id]/page.tsx
// Halaman detail materi keilmuan — sesuai screenshot 2 & 3
// Navbar & footer dari (public)/layout.tsx

import { createClient } from '@/supabase/server'
import MateriDetailClient from './MateriDeltailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MateriDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch materi + quiz + pertanyaan sekaligus
  const { data: materi } = await supabase
    .from('materials')
    .select(`
      *,
      keilmuan:keilmuan_id(id, nama),
      asatidz:asatidz_id(nama, foto_url),
      quizzes(
        id, title, description,
        quiz_questions(id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_no)
      )
    `)
    .eq('id', id)
    .single()

  // Kalau tidak ada data (misal id dummy), pakai fallback
  const item = materi ?? {
    id,
    title: 'Hukumnya Tahlilan Bersama Ust. Adi Hidayat',
    description: 'Tahlilan merupakan salah satu tradisi keagamaan yang sudah lama hidup dan berkembang di tengah masyarakat Muslim Indonesia. Kegiatan ini biasanya dilakukan dengan membaca kalimat tahlil (lā ilāha illallāh), dzikir, doa-doa, serta ayat-ayat Al-Qur\'an, yang sering kali dihadiahkan pahalanya untuk orang yang telah meninggal dunia. Selain itu, tahlilan juga menjadi sarana berkumpulnya keluarga, tetangga, dan masyarakat sekitar untuk saling mendoakan, mempererat silaturahmi, serta menguatkan rasa kebersamaan.',
    youtube_url: null,
    level: 'Mudah',
    keilmuan: { nama: 'Akhlak' },
    asatidz: { nama: 'Ust. Adi Hidayat' },
    quizzes: [
      {
        id: 'quiz-1',
        title: 'Kuis Seputar Topik',
        description: 'Beberapa pertanyaan mengenai materi pada video',
        quiz_questions: [
          { id: 'q1', question: 'Hukum melaksanakan shalat lima waktu adalah...', option_a: 'Sunnah', option_b: 'Wajib', option_c: 'Mubah', option_d: 'Makruh', correct_answer: 'option_b', order_no: 1 },
          { id: 'q2', question: 'Hukum melaksanakan shalat lima waktu adalah...', option_a: 'Sunnah', option_b: 'Wajib', option_c: 'Mubah', option_d: 'Makruh', correct_answer: 'option_b', order_no: 2 },
        ]
      }
    ],
  }

  return <MateriDetailClient materi={item} />
}