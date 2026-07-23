import { router } from 'expo-router'
import { ProfileScreen } from '@kajianku/ui-web'

export default function ProfilePage() {
  return <ProfileScreen navigate={(href) => router.push(href as never)} />
}
