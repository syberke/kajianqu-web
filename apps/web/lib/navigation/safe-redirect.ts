export function safeInternalPath(value: string | null | undefined, fallback = '/welcome') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback

  try {
    const parsed = new URL(value, 'https://kajianqu.local')
    if (parsed.origin !== 'https://kajianqu.local') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
