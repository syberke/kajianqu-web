import { router } from 'expo-router'
import { NotificationsScreen } from '@kajianku/ui-mobile'

export default function NotificationsPage() {
  return <NotificationsScreen navigate={(href) => router.push(href as never)} />
}
