import { useLocalSearchParams } from 'expo-router'
import { ChatRoomScreen } from '@kajianku/ui-web'

export default function ChatRoomPage() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>()
  return <ChatRoomScreen roomId={String(roomId)} />
}
