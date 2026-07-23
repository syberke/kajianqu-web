import { describe, expect, it } from 'vitest'

import { canMessage } from './can-message'

describe('direct chat authorization', () => {
  const student = { role: 'siswa', isActive: true }

  it('blocks chat with an asatidz who is not approved', () => {
    expect(canMessage(student, { role: 'asatidz', isActive: true, asatidzApproved: false })).toBe(false)
  })

  it('allows student and approved asatidz to chat', () => {
    expect(canMessage(student, { role: 'asatidz', isActive: true, asatidzApproved: true })).toBe(true)
  })

  it('blocks inactive accounts and same-role direct chat', () => {
    expect(canMessage(student, { role: 'asatidz', isActive: false, asatidzApproved: true })).toBe(false)
    expect(canMessage(student, { role: 'siswa', isActive: true })).toBe(false)
  })
})
