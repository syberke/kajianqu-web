import type { QuranSession, SessionHistory } from '@/types/quran'

export async function saveSession(
  session: Omit<QuranSession, 'id' | 'createdAt' | 'userId'>,
): Promise<string | null> {
  const requestId = crypto.randomUUID()

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('/api/quran/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ ...session, requestId }),
      })

      const rawPayload = await response.text()
      let payload: { id?: string; error?: string } = {}
      if (rawPayload) {
        try {
          payload = JSON.parse(rawPayload) as { id?: string; error?: string }
        } catch {
          payload = {}
        }
      }

      if (response.ok && payload.id) return payload.id

      const retryable = response.status === 503 && attempt === 0
      if (retryable) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }

      console.error('Error saving Quran session', {
        status: response.status,
        error: payload.error || rawPayload || 'Respons server kosong',
      })
      return null
    } catch (error) {
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }

      console.error('Error saving Quran session', {
        error: error instanceof Error ? error.message : 'Gagal terhubung ke server',
      })
    }
  }

  return null
}

export async function getSessionHistory(limit = 20): Promise<SessionHistory[]> {
  const response = await fetch(`/api/quran/sessions?limit=${encodeURIComponent(String(limit))}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) return []
  const payload = (await response.json()) as { sessions?: SessionHistory[] }
  return payload.sessions ?? []
}

export async function getMostMistakenWords(limit = 10) {
  const response = await fetch(`/api/quran/mistakes?limit=${encodeURIComponent(String(limit))}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []

  const payload = (await response.json()) as {
    mistakes?: Array<{ word: string; surahId: number; ayahNumber: number; count: number }>
  }
  return payload.mistakes ?? []
}
