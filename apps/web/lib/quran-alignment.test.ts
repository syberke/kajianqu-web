import { describe, expect, it } from 'vitest'

import { alignRecitation } from '@/lib/quran-alignment'
import type { QuranWord } from '@/types/quran'

const expectedWords: QuranWord[] = [
  { arabic: 'بِسْمِ', simple: 'بسم', ayahNumber: 1, wordIndex: 1 },
  { arabic: 'اللَّهِ', simple: 'الله', ayahNumber: 1, wordIndex: 2 },
  { arabic: 'الرَّحْمَٰنِ', simple: 'الرحمن', ayahNumber: 1, wordIndex: 3 },
  { arabic: 'الرَّحِيمِ', simple: 'الرحيم', ayahNumber: 1, wordIndex: 4 },
  { arabic: 'الْحَمْدُ', simple: 'الحمد', ayahNumber: 2, wordIndex: 1 },
  { arabic: 'لِلَّهِ', simple: 'لله', ayahNumber: 2, wordIndex: 2 },
  { arabic: 'رَبِّ', simple: 'رب', ayahNumber: 2, wordIndex: 3 },
  { arabic: 'الْعَالَمِينَ', simple: 'العالمين', ayahNumber: 2, wordIndex: 4 },
]

describe('alignRecitation', () => {
  it('marks an exact complete recitation as correct', () => {
    const result = alignRecitation(
      expectedWords,
      'بسم الله الرحمن الرحيم الحمد لله رب العالمين',
      true,
    )

    expect(result.accuracy).toBe(100)
    expect(result.correctWords).toBe(expectedWords.length)
    expect(result.mistakes).toHaveLength(0)
  })

  it('marks the unread ending as omitted', () => {
    const result = alignRecitation(expectedWords, 'بسم الله الرحمن الرحيم', true)

    expect(result.correctWords).toBe(4)
    expect(result.accuracy).toBe(50)
    expect(result.mistakes.filter((mistake) => mistake.kind === 'omission')).toHaveLength(4)
  })

  it('does not accept a different surah as the target recitation', () => {
    const result = alignRecitation(
      expectedWords,
      'قل اعوذ برب الناس ملك الناس اله الناس من شر الوسواس',
      true,
    )

    expect(result.accuracy).toBeLessThan(40)
    expect(result.correctWords).toBeLessThan(4)
    expect(result.mistakes.length).toBeGreaterThan(4)
  })

  it('reports words skipped between a correct beginning and ending', () => {
    const result = alignRecitation(
      expectedWords,
      'بسم الله الرحيم الحمد العالمين',
      true,
    )

    expect(result.accuracy).toBeLessThan(100)
    expect(result.mistakes.some((mistake) => mistake.kind === 'omission')).toBe(true)
  })
})
