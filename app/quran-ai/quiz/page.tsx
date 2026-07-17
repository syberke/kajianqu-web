import QuranQuizClient from '@/components/quran/QuranQuizClient'
import { getQuranChapters } from '@/lib/quran-api'

export default async function QuranAiQuizPage() {
  const chapters = await getQuranChapters()
  return <QuranQuizClient chapters={chapters} />
}
