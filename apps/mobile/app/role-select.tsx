import { router } from 'expo-router'
import { RoleSelectionScreen } from '@kajianku/ui-mobile'

export default function RoleSelectPage() {
  return <RoleSelectionScreen navigate={(href) => router.push(href as never)} />
}
