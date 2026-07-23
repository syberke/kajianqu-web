const DEVELOPMENT_CONNECTION_LIMIT = 5

/**
 * Adds safe Prisma defaults without changing credentials or the selected host.
 * Invalid/non-Postgres values are returned unchanged so Prisma can report them.
 */
export function getRuntimeDatabaseUrl(
  rawUrl: string | undefined,
  nodeEnv = process.env.NODE_ENV,
): string | undefined {
  if (!rawUrl) return undefined

  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') return rawUrl

    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '30')
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '30')

    // Supabase transaction pooler does not support prepared statements.
    if (url.port === '6543' && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }

    // A persistent local Next.js process needs more than one connection because
    // several server components and route handlers can query concurrently.
    if (nodeEnv === 'development') {
      const configuredLimit = Number(url.searchParams.get('connection_limit'))
      if (!Number.isFinite(configuredLimit) || configuredLimit < DEVELOPMENT_CONNECTION_LIMIT) {
        url.searchParams.set('connection_limit', String(DEVELOPMENT_CONNECTION_LIMIT))
      }
    }

    return url.toString()
  } catch {
    return rawUrl
  }
}
