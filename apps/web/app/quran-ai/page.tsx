import QuranAiHubClient from '@/components/quran/QuranAiHubClient'
import { getQuranChapters } from '@/lib/quran-api'
import type { QuranPracticeMode } from '@/types/quran'

export default async function QuranAiPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const query = await searchParams
  const chapters = await getQuranChapters()
  const initialMode: QuranPracticeMode = query.mode === 'belajar' ? 'belajar' : 'murojaah'

  return <QuranAiHubClient chapters={chapters} initialMode={initialMode} />
}
