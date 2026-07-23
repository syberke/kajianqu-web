import { describe, expect, it } from 'vitest'
import { can, landingRoute } from './index'

describe('permission matrix', () => {
  it('prevents students from publishing material', () => {
    expect(can('siswa', 'material:publish')).toBe(false)
  })

  it('allows only admins to publish material', () => {
    expect(can('admin', 'material:publish')).toBe(true)
    expect(can('asatidz', 'material:publish')).toBe(false)
  })

  it('routes each role to its own dashboard', () => {
    expect(landingRoute('admin')).toBe('/admin')
    expect(landingRoute('asatidz')).toBe('/asatidz')
    expect(landingRoute('siswa')).toBe('/siswa')
  })
})
