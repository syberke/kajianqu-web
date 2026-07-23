import ClassChatWorkspace from '@/components/chat/ClassChatWorkspace'

export default async function ClassChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  return <ClassChatWorkspace roomId={roomId} />
}
