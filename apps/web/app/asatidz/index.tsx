import { router } from 'expo-router'
import { RoleDashboardScreen } from '@kajianku/ui-web'

export default function AsatidzPage() {
  return <RoleDashboardScreen role="asatidz" navigate={(href) => router.push(href as never)} />
}
