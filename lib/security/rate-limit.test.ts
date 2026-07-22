import { describe, expect, it } from 'vitest'

import { checkRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  it('blocks after the configured limit and resets after the window', () => {
    const key = `test:${crypto.randomUUID()}`
    expect(checkRateLimit(key, 2, 1_000, 100).allowed).toBe(true)
    expect(checkRateLimit(key, 2, 1_000, 200).allowed).toBe(true)
    expect(checkRateLimit(key, 2, 1_000, 300).allowed).toBe(false)
    expect(checkRateLimit(key, 2, 1_000, 1_101).allowed).toBe(true)
  })
})
