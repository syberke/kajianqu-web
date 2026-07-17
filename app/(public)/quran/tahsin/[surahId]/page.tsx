import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ surahId: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function LegacyTahsinPage({ params, searchParams }: Props) {
  const { surahId } = await params
  const query = await searchParams
  const search = new URLSearchParams()
  if (query.start) search.set('start', query.start)
  if (query.end) search.set('end', query.end)
  redirect(`/quran-ai/belajar/${surahId}${search.size ? `?${search.toString()}` : ''}`)
}
