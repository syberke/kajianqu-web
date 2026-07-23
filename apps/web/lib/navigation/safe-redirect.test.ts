import { describe, expect, it } from 'vitest'

import { safeInternalPath } from './safe-redirect'

describe('safeInternalPath', () => {
  it('accepts an internal path with query string', () => {
    expect(safeInternalPath('/quran-ai?mode=belajar')).toBe('/quran-ai?mode=belajar')
  })

  it.each(['https://evil.test', '//evil.test/path', 'javascript:alert(1)', ''])('rejects %s', (value) => {
    expect(safeInternalPath(value)).toBe('/welcome')
  })
})
