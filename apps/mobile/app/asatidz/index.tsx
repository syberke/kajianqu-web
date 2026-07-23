import { router } from 'expo-router'
import { RoleDashboardScreen } from '@kajianku/ui-mobile'

export default function AsatidzPage() {
  return <RoleDashboardScreen role="asatidz" navigate={(href) => router.push(href as never)} />
}
