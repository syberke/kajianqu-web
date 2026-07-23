import { useLocalSearchParams } from 'expo-router'
import { ChatRoomScreen } from '@kajianku/ui-mobile'

export default function ChatRoomPage() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>()
  return <ChatRoomScreen roomId={String(roomId)} />
}
