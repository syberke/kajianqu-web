import { router } from 'expo-router'
import { PrivateClassesScreen } from '@kajianku/ui-web'

export default function ClassesPage() {
  return <PrivateClassesScreen navigate={(href) => router.push(href as never)} />
}
