import { router, useLocalSearchParams } from 'expo-router'
import { QuranReaderScreen } from '@kajianku/ui-web'

export default function ReaderPage() {
  const { surah } = useLocalSearchParams<{ surah: string }>()
  return <QuranReaderScreen navigate={(href) => router.push(href as never)} surahNumber={Number(surah) || 1} />
}
