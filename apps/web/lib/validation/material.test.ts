import { describe, expect, it } from 'vitest'

import { asatidzMaterialSchema } from './material'

describe('asatidz material workflow validation', () => {
  it('requires a minimum 30-minute duration for YouTube material', () => {
    const result = asatidzMaterialSchema.safeParse({
      title: 'Kajian Fikih',
      youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
      durationMinutes: 29,
    })
    expect(result.success).toBe(false)
  })

  it('accepts text material without a video', () => {
    const result = asatidzMaterialSchema.safeParse({
      title: 'Pengantar Muamalat',
      description: 'Materi teks yang menjelaskan prinsip muamalat.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty material', () => {
    const result = asatidzMaterialSchema.safeParse({ title: 'Materi Kosong' })
    expect(result.success).toBe(false)
  })
})
