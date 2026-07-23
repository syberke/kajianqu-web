export type SurahSummary = {
  id: number
  nameSimple: string
  nameArabic: string
  translatedName: string
  versesCount: number
  revelationPlace: 'makkah' | 'madinah'
}

export type QuranWordFeedback = {
  expected: string | null
  spoken: string | null
  status: 'correct' | 'substitution' | 'missing' | 'extra'
}

export type QuranPracticeResult = {
  normalizedExpected: string
  normalizedTranscript: string
  accuracy: number
  correctWords: number
  totalWords: number
  feedback: QuranWordFeedback[]
}

export const fallbackSurahs: SurahSummary[] = [
  { id: 1, nameSimple: 'Al-Fatihah', nameArabic: 'الفاتحة', translatedName: 'Pembukaan', versesCount: 7, revelationPlace: 'makkah' },
  { id: 2, nameSimple: 'Al-Baqarah', nameArabic: 'البقرة', translatedName: 'Sapi Betina', versesCount: 286, revelationPlace: 'madinah' },
  { id: 3, nameSimple: "Ali 'Imran", nameArabic: 'آل عمران', translatedName: 'Keluarga Imran', versesCount: 200, revelationPlace: 'madinah' },
  { id: 4, nameSimple: "An-Nisa'", nameArabic: 'النساء', translatedName: 'Wanita', versesCount: 176, revelationPlace: 'madinah' },
  { id: 5, nameSimple: "Al-Ma'idah", nameArabic: 'المائدة', translatedName: 'Hidangan', versesCount: 120, revelationPlace: 'madinah' },
]

const arabicMarks = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g
const punctuation = /[^\p{L}\p{N}\s]/gu

export function normalizeArabic(value: string): string {
  return value
    .normalize('NFKC')
    .replace(arabicMarks, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .replace(punctuation, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function minBy<T>(items: T[], score: (item: T) => number): T {
  return items.reduce((best, current) => (score(current) < score(best) ? current : best))
}

export function compareRecitation(expected: string, transcript: string): QuranPracticeResult {
  const normalizedExpected = normalizeArabic(expected)
  const normalizedTranscript = normalizeArabic(transcript)
  const left = normalizedExpected ? normalizedExpected.split(' ') : []
  const right = normalizedTranscript ? normalizedTranscript.split(' ') : []
  const matrix: number[][] = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0),
  )

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
    }
  }

  const feedback: QuranWordFeedback[] = []
  let i = left.length
  let j = right.length
  while (i > 0 || j > 0) {
    const candidates: Array<{ type: QuranWordFeedback['status']; i: number; j: number; cost: number }> = []
    if (i > 0 && j > 0) {
      candidates.push({
        type: left[i - 1] === right[j - 1] ? 'correct' : 'substitution',
        i: i - 1,
        j: j - 1,
        cost: matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      })
    }
    if (i > 0) candidates.push({ type: 'missing', i: i - 1, j, cost: matrix[i - 1][j] + 1 })
    if (j > 0) candidates.push({ type: 'extra', i, j: j - 1, cost: matrix[i][j - 1] + 1 })
    const next = minBy(candidates, (candidate) => candidate.cost)
    feedback.push({
      expected: next.type === 'extra' ? null : left[i - 1],
      spoken: next.type === 'missing' ? null : right[j - 1],
      status: next.type,
    })
    i = next.i
    j = next.j
  }

  feedback.reverse()
  const correctWords = feedback.filter((item) => item.status === 'correct').length
  const totalWords = Math.max(left.length, 1)
  return {
    normalizedExpected,
    normalizedTranscript,
    accuracy: Math.max(0, Math.round((correctWords / totalWords) * 100)),
    correctWords,
    totalWords: left.length,
    feedback,
  }
}
