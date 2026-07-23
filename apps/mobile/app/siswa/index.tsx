import { router } from 'expo-router'
import { RoleDashboardScreen } from '@kajianku/ui-mobile'

export default function StudentPage() {
  return <RoleDashboardScreen role="siswa" navigate={(href) => router.push(href as never)} />
}
