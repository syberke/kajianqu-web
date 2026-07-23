import { router } from 'expo-router'
import { HomeScreen } from '@kajianku/ui-mobile'

export default function HomePage() {
  return <HomeScreen navigate={(href) => router.push(href as never)} role="siswa" />
}
