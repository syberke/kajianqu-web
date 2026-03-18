// app/(public)/quran/[mode]/[surahId]/page.tsx
// Halaman setoran Quran — Tahfidz atau Tahsin
// mode: 'tahfidz' | 'tahsin'
// surahId: nomor surat 1-114

import { notFound } from 'next/navigation'
import { QURAN_SURAHS } from '@/lib/quran-data'
import QuranSetoranClient from './QuranSetoranClient'

interface Props {
  params: Promise<{ mode: string; surahId: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function QuranSetoranPage({ params, searchParams }: Props) {
  const { mode, surahId } = await params
  const { start, end }    = await searchParams

  if (mode !== 'tahfidz' && mode !== 'tahsin') notFound()

  const id    = parseInt(surahId)
  const surah = QURAN_SURAHS[id]

  // Kalau surah tidak ada di data lokal, tetap render dengan info minimal
  const surahInfo = surah
    ? { id, name: surah.name, arabic: surah.nameArabic, totalAyat: surah.totalAyat, type: 'Makkiyah' }
    : { id, name: `Surah ${id}`, arabic: '', totalAyat: 7, type: 'Makkiyah' }

  const ayahStart = parseInt(start || '1')
  const ayahEnd   = parseInt(end   || String(surahInfo.totalAyat))

  return (
    <QuranSetoranClient
      mode={mode as 'tahfidz' | 'tahsin'}
      surahInfo={surahInfo}
      ayahStart={ayahStart}
      ayahEnd={ayahEnd}
    />
  )
}