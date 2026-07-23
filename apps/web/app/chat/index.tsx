import { router } from 'expo-router'
import { ChatRoomsScreen } from '@kajianku/ui-web'

export default function ChatPage() {
  return <ChatRoomsScreen navigate={(href) => router.push(href as never)} />
}
