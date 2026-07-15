import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ surahId: string }>
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function LegacyTahsinPage({ params, searchParams }: Props) {
  const { surahId } = await params
  const query = await searchParams
  const paramsString = new URLSearchParams()
  if (query.start) paramsString.set('start', query.start)
  if (query.end) paramsString.set('end', query.end)
  redirect(`/quran/murojaah/${surahId}${paramsString.size ? `?${paramsString.toString()}` : ''}`)
}
