import type { QuranSession, SessionHistory } from '@/types/quran'

export async function saveSession(
  session: Omit<QuranSession, 'id' | 'createdAt' | 'userId'>,
): Promise<string | null> {
  const response = await fetch('/api/quran/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(session),
  })

  if (!response.ok) {
    console.error('Error saving Quran session', await response.text())
    return null
  }

  const payload = (await response.json()) as { id?: string }
  return payload.id ?? null
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
