import QuranClient from './QuranClient'
import { getQuranChapters } from '@/lib/quran-api'

export default async function QuranPage() {
  const chapters = await getQuranChapters()
  return <QuranClient chapters={chapters} />
}
