import { router } from 'expo-router'
import { ChatRoomsScreen } from '@kajianku/ui-mobile'

export default function ChatPage() {
  return <ChatRoomsScreen navigate={(href) => router.push(href as never)} />
}
