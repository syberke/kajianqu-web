import { describe, expect, it } from 'vitest'

import { canMessage } from './can-message'

describe('canMessage', () => {
  const siswa = { role: 'siswa', isActive: true }
  const asatidz = { role: 'asatidz', isActive: true, asatidzApproved: true }

  it('allows an active student and approved asatidz', () => {
    expect(canMessage(siswa, asatidz)).toBe(true)
  })

  it('rejects unapproved asatidz and same-role messaging', () => {
    expect(canMessage(siswa, { ...asatidz, asatidzApproved: false })).toBe(false)
    expect(canMessage(siswa, siswa)).toBe(false)
  })
})
