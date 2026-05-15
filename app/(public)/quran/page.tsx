import { QURAN_SURAHS } from '@/lib/quran-data'
import QuranSetoranClient from './QuranClient'

interface Props {
  params:       Promise<{ surahId: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function TahsinPage({ params, searchParams }: Props) {
  const { surahId }    = await params
  const { start, end } = await searchParams

  const mode = 'tahsin' // ✅ hardcode, BUKAN dari params

  const id    = parseInt(surahId)
  const surah = QURAN_SURAHS[id]

  const surahInfo = surah
    ? { id, name: surah.name, arabic: surah.nameArabic, totalAyat: surah.totalAyat, type: 'Makkiyah' }
    : { id, name: `Surah ${id}`, arabic: '', totalAyat: 7, type: 'Makkiyah' }

  const ayahStart = parseInt(start || '1')
  const ayahEnd   = parseInt(end   || String(surahInfo.totalAyat))

  return (
    <QuranSetoranClient
      mode={mode}
      surahInfo={surahInfo}
      ayahStart={ayahStart}
      ayahEnd={ayahEnd}
    />
  )
}