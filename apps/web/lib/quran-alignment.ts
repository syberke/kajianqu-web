import type { QuranWord, SessionMistake, WordState } from '@/types/quran'

export interface AlignmentResult {
  states: WordState[]
  mistakes: SessionMistake[]
  currentIndex: number
  correctWords: number
  processedWords: number
  accuracy: number
}

type AlignmentOperation =
  | { kind: 'match' | 'substitution'; expectedIndex: number; spokenIndex: number; similarity: number }
  | { kind: 'omission'; expectedIndex: number }
  | { kind: 'insertion'; spokenIndex: number }

export function normalizeArabic(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/ـ/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function transcriptWords(transcript: string): string[] {
  const normalized = normalizeArabic(transcript)
  return normalized ? normalized.split(' ').filter(Boolean) : []
}

function editDistance(left: string, right: string): number {
  const a = normalizeArabic(left)
  const b = normalizeArabic(right)
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  )

  for (let row = 0; row <= a.length; row += 1) matrix[row][0] = row
  for (let col = 0; col <= b.length; col += 1) matrix[0][col] = col

  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const substitution = a[row - 1] === b[col - 1] ? 0 : 1
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + substitution,
      )
    }
  }

  return matrix[a.length][b.length]
}

export function wordSimilarity(expected: string, spoken: string): number {
  const left = normalizeArabic(expected)
  const right = normalizeArabic(spoken)
  const longest = Math.max(left.length, right.length)
  if (longest === 0) return 1
  return 1 - editDistance(left, right) / longest
}

function isAcceptedWord(expected: string, spoken: string): boolean {
  const left = normalizeArabic(expected)
  const right = normalizeArabic(spoken)
  if (left === right) return true
  if (Math.min(left.length, right.length) < 4) return false
  return wordSimilarity(left, right) >= 0.84
}

export function alignRecitation(
  expectedWords: QuranWord[],
  transcript: string,
  isFinal = false,
): AlignmentResult {
  const spoken = transcriptWords(transcript)
  const states: WordState[] = expectedWords.map(() => 'idle')

  if (spoken.length === 0) {
    if (expectedWords.length > 0) states[0] = 'current'
    return {
      states,
      mistakes: [],
      currentIndex: 0,
      correctWords: 0,
      processedWords: 0,
      accuracy: 0,
    }
  }

  // During streaming, constrain alignment to a moving prefix. This prevents a
  // repeated phrase from jumping dozens of words ahead in the mushaf.
  const prefixLength = isFinal
    ? expectedWords.length
    : Math.min(expectedWords.length, spoken.length + Math.max(6, Math.ceil(spoken.length * 0.2)))
  const expected = expectedWords.slice(0, prefixLength)

  const rows = expected.length + 1
  const cols = spoken.length + 1
  const costs = Array.from({ length: rows }, () => Array<number>(cols).fill(0))
  const paths = Array.from({ length: rows }, () => Array<AlignmentOperation | null>(cols).fill(null))

  for (let row = 1; row < rows; row += 1) {
    costs[row][0] = row
    paths[row][0] = { kind: 'omission', expectedIndex: row - 1 }
  }
  for (let col = 1; col < cols; col += 1) {
    costs[0][col] = col * 0.9
    paths[0][col] = { kind: 'insertion', spokenIndex: col - 1 }
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const similarity = wordSimilarity(expected[row - 1].simple ?? expected[row - 1].arabic, spoken[col - 1])
      const accepted = isAcceptedWord(expected[row - 1].simple ?? expected[row - 1].arabic, spoken[col - 1])
      const substitutionCost = costs[row - 1][col - 1] + (accepted ? 0 : 1 - similarity * 0.35)
      const omissionCost = costs[row - 1][col] + 1
      const insertionCost = costs[row][col - 1] + 0.9
      const best = Math.min(substitutionCost, omissionCost, insertionCost)
      costs[row][col] = best

      if (best === substitutionCost) {
        paths[row][col] = {
          kind: accepted ? 'match' : 'substitution',
          expectedIndex: row - 1,
          spokenIndex: col - 1,
          similarity,
        }
      } else if (best === omissionCost) {
        paths[row][col] = { kind: 'omission', expectedIndex: row - 1 }
      } else {
        paths[row][col] = { kind: 'insertion', spokenIndex: col - 1 }
      }
    }
  }

  const operations: AlignmentOperation[] = []
  let row = expected.length
  let col = spoken.length
  while (row > 0 || col > 0) {
    const operation = paths[row][col]
    if (!operation) break
    operations.push(operation)
    if (operation.kind === 'match' || operation.kind === 'substitution') {
      row -= 1
      col -= 1
    } else if (operation.kind === 'omission') {
      row -= 1
    } else {
      col -= 1
    }
  }
  operations.reverse()

  const mistakes: SessionMistake[] = []
  let lastExpectedIndex = -1

  for (const operation of operations) {
    if (operation.kind === 'match') {
      states[operation.expectedIndex] = 'correct'
      lastExpectedIndex = Math.max(lastExpectedIndex, operation.expectedIndex)
      continue
    }

    if (operation.kind === 'substitution') {
      const word = expected[operation.expectedIndex]
      states[operation.expectedIndex] = 'wrong'
      mistakes.push({
        wordArabic: word.arabic,
        wordSpoken: spoken[operation.spokenIndex],
        ayahNumber: word.ayahNumber,
        wordIndex: word.wordIndex,
        kind: 'substitution',
        confidence: operation.similarity,
      })
      lastExpectedIndex = Math.max(lastExpectedIndex, operation.expectedIndex)
      continue
    }

    if (operation.kind === 'omission') {
      // Do not declare trailing words as missed while the reader is still talking.
      const hasSpokenAfter = operations.some(
        (candidate) =>
          (candidate.kind === 'match' || candidate.kind === 'substitution') &&
          candidate.expectedIndex > operation.expectedIndex,
      )
      if (isFinal || hasSpokenAfter) {
        const word = expected[operation.expectedIndex]
        states[operation.expectedIndex] = 'missed'
        mistakes.push({
          wordArabic: word.arabic,
          wordSpoken: '',
          ayahNumber: word.ayahNumber,
          wordIndex: word.wordIndex,
          kind: 'omission',
          confidence: 0,
        })
        lastExpectedIndex = Math.max(lastExpectedIndex, operation.expectedIndex)
      }
      continue
    }

    const anchorIndex = Math.min(Math.max(lastExpectedIndex, 0), expected.length - 1)
    const anchor = expected[anchorIndex]
    if (anchor) {
      mistakes.push({
        wordArabic: '',
        wordSpoken: spoken[operation.spokenIndex],
        ayahNumber: anchor.ayahNumber,
        wordIndex: anchor.wordIndex,
        kind: 'insertion',
        confidence: 0,
      })
    }
  }

  const currentIndex = Math.min(
    expectedWords.length,
    Math.max(0, lastExpectedIndex + 1),
  )
  if (!isFinal && currentIndex < states.length && states[currentIndex] === 'idle') {
    states[currentIndex] = 'current'
  }

  const processedStates = states.filter((state) =>
    state === 'correct' || state === 'wrong' || state === 'missed',
  )
  const correctWords = states.filter((state) => state === 'correct').length
  const processedWords = processedStates.length
  const accuracy = processedWords > 0 ? (correctWords / processedWords) * 100 : 0

  return {
    states,
    mistakes,
    currentIndex,
    correctWords,
    processedWords,
    accuracy,
  }
}
