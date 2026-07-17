import { notFound } from 'next/navigation'

import QuranPracticeClient from '@/components/quran/QuranPracticeClient'
import { getQuranChapters, getQuranRange } from '@/lib/quran-api'

interface Props {
  params: Promise<{ surahId: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function BelajarQuranPage({ params, searchParams }: Props) {
  const { surahId } = await params
  const query = await searchParams
  const chapterId = Number(surahId)
  const chapters = await getQuranChapters()
  const chapter = chapters.find((item) => item.id === chapterId)
  if (!chapter) notFound()

  const start = Math.max(1, Math.min(Number(query.start) || 1, chapter.versesCount))
  const end = Math.max(start, Math.min(Number(query.end) || chapter.versesCount, chapter.versesCount))
  const verses = await getQuranRange(chapterId, start, end)

  return <QuranPracticeClient mode="belajar" chapter={chapter} verses={verses} ayahStart={start} ayahEnd={end} />
}
