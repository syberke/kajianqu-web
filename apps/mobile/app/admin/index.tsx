import { router } from 'expo-router'
import { RoleDashboardScreen } from '@kajianku/ui-mobile'

export default function AdminPage() {
  return <RoleDashboardScreen role="admin" navigate={(href) => router.push(href as never)} />
}
