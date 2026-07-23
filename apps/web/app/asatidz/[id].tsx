import { router, useLocalSearchParams } from 'expo-router'
import { AsatidzDetailScreen } from '@kajianku/ui-web'

export default function AsatidzDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <AsatidzDetailScreen id={String(id)} navigate={(href) => router.push(href as never)} />
}
