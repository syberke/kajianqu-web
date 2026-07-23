import ChatWorkspace from '@/components/chat/ChatWorkspace'

interface PageProps { searchParams: Promise<{ user?: string }> }

export default async function AsatidzChatPage({ searchParams }: PageProps) {
  const { user } = await searchParams
  return <ChatWorkspace heading="Pesan siswa" initialUserId={user} />
}
