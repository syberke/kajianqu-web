export interface ChatUser {
  id: string
  nama: string | null
  fotoUrl: string | null
  role: string | null
}

export interface ChatMessage {
  id: string
  content: string
  createdAt: string
  mine: boolean
}

export interface ChatConversation {
  user: ChatUser
  lastMessage: ChatMessage
}

export const ChatService = {
  async getInbox(): Promise<ChatConversation[]> {
    const response = await fetch('/api/chat/inbox', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Gagal mengambil daftar percakapan')
    const payload = (await response.json()) as { conversations?: ChatConversation[] }
    return payload.conversations ?? []
  },

  async getChatHistory(userId: string): Promise<{ counterpart: ChatUser; messages: ChatMessage[] }> {
    const response = await fetch(`/api/chat/history/${encodeURIComponent(userId)}`, {
      headers: { Accept: 'application/json' },
    })
    const payload = (await response.json().catch(() => null)) as {
      counterpart?: ChatUser
      messages?: ChatMessage[]
      error?: string
    } | null
    if (!response.ok || !payload?.counterpart) {
      throw new Error(payload?.error ?? 'Gagal mengambil riwayat chat')
    }
    return { counterpart: payload.counterpart, messages: payload.messages ?? [] }
  },

  async sendMessage(receiverId: string, content: string): Promise<ChatMessage> {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ receiverId, content }),
    })
    const payload = (await response.json().catch(() => null)) as { message?: ChatMessage; error?: string } | null
    if (!response.ok || !payload?.message) throw new Error(payload?.error ?? 'Gagal mengirim pesan')
    return payload.message
  },
}
