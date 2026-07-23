import { describe, expect, it } from 'vitest'

import { getRuntimeDatabaseUrl } from './database-url'

describe('getRuntimeDatabaseUrl', () => {
  it('raises a too-small local pool limit and adds timeouts', () => {
    const result = new URL(
      getRuntimeDatabaseUrl(
        'postgresql://user:secret@example.supabase.com:5432/postgres?connection_limit=1&sslmode=require',
        'development',
      )!,
    )

    expect(result.searchParams.get('connection_limit')).toBe('5')
    expect(result.searchParams.get('pool_timeout')).toBe('30')
    expect(result.searchParams.get('connect_timeout')).toBe('30')
    expect(result.searchParams.get('sslmode')).toBe('require')
  })

  it('configures Prisma for the Supabase transaction pooler', () => {
    const result = new URL(
      getRuntimeDatabaseUrl(
        'postgresql://user:secret@example.supabase.com:6543/postgres?connection_limit=1',
        'production',
      )!,
    )

    expect(result.searchParams.get('connection_limit')).toBe('1')
    expect(result.searchParams.get('pgbouncer')).toBe('true')
    expect(result.searchParams.get('pool_timeout')).toBe('30')
  })

  it('does not rewrite invalid values', () => {
    expect(getRuntimeDatabaseUrl('not-a-url', 'development')).toBe('not-a-url')
    expect(getRuntimeDatabaseUrl(undefined, 'development')).toBeUndefined()
  })
})
