import { router } from 'expo-router'
import { QuranLibraryScreen } from '@kajianku/ui-mobile'

export default function QuranPage() {
  return <QuranLibraryScreen navigate={(href) => router.push(href as never)} />
}
