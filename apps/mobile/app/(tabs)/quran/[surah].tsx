import { router, useLocalSearchParams } from 'expo-router'
import { QuranReaderScreen } from '@kajianku/ui-mobile'

export default function QuranReaderPage() {
  const { surah } = useLocalSearchParams<{ surah: string }>()
  return <QuranReaderScreen navigate={(href) => router.push(href as never)} surahNumber={Number(surah) || 1} />
}
