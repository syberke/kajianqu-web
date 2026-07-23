import { describe, expect, it } from 'vitest'
import { compareRecitation, normalizeArabic } from './index'

describe('Quran recitation comparison', () => {
  it('normalizes harakat without changing word order', () => {
    expect(normalizeArabic('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ')).toBe('بسم الله الرحمن الرحيم')
  })

  it('detects missing and substituted words', () => {
    const result = compareRecitation(
      'بسم الله الرحمن الرحيم الحمد لله رب العالمين',
      'بسم الله الرحيم الحمد رب الناس',
    )
    expect(result.accuracy).toBeLessThan(100)
    expect(result.feedback.some((item) => item.status === 'missing')).toBe(true)
    expect(result.feedback.some((item) => item.status === 'substitution')).toBe(true)
  })

  it('does not mark a partial recitation as fully correct', () => {
    const result = compareRecitation('الحمد لله رب العالمين', 'الحمد')
    expect(result.accuracy).toBe(25)
  })
})
