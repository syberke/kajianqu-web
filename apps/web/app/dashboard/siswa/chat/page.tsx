import ChatWorkspace from '@/components/chat/ChatWorkspace'

interface PageProps { searchParams: Promise<{ ustadz?: string }> }

export default async function StudentChatPage({ searchParams }: PageProps) {
  const { ustadz } = await searchParams
  return <ChatWorkspace heading="Chat ustadz" initialUserId={ustadz} />
}
