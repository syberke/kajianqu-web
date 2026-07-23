import { useLocalSearchParams } from 'expo-router'
import { PlaceholderScreen } from '@kajianku/ui-web'

export default function CatchAllPage() {
  const { path } = useLocalSearchParams<{ path?: string[] }>()
  return <PlaceholderScreen title={(path || []).join(' / ') || 'Halaman'} />
}
