import { router, useLocalSearchParams } from 'expo-router'
import { MaterialDetailScreen } from '@kajianku/ui-web'

export default function MaterialDetailPage() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>()
  return <MaterialDetailScreen identifier={String(identifier)} navigate={(href) => router.push(href as never)} />
}
