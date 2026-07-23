import { router } from 'expo-router'
import { PrivateClassesScreen } from '@kajianku/ui-mobile'

export default function KelasPage() {
  return <PrivateClassesScreen navigate={(href) => router.push(href as never)} />
}
