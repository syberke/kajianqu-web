import { router } from 'expo-router'
import { AsatidzDirectoryScreen } from '@kajianku/ui-mobile'

export default function AsatidzListPage() {
  return <AsatidzDirectoryScreen navigate={(href) => router.push(href as never)} />
}
