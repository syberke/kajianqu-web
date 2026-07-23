import { router } from 'expo-router'
import { QuranLibraryScreen } from '@kajianku/ui-web'

export default function QuranPage() {
  return <QuranLibraryScreen navigate={(href) => router.push(href as never)} />
}
