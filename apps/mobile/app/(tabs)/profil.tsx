import { router } from 'expo-router'
import { ProfileScreen } from '@kajianku/ui-mobile'

export default function ProfilePage() {
  return <ProfileScreen navigate={(href) => router.push(href as never)} />
}
