// components/quran/QuranWordDisplay.tsx
'use client'

import { WordState } from '@/types/quran'
import { cn } from '@/lib/utils'

interface QuranWord {
  arabic: string
  ayahNumber: number
  wordIndex: number
}

interface Props {
  words: QuranWord[]
  states: WordState[]
  currentIndex: number
  latin?: string
  translation?: string
}

export function QuranWordDisplay({ words, states, currentIndex, latin, translation }: Props) {
  return (
    <div className="rounded-xl bg-muted/50 p-5 min-h-[120px]">
      {/* Teks Arab */}
      <div
        className="text-right leading-loose mb-3"
        dir="rtl"
        style={{ fontFamily: "'Scheherazade New', 'Traditional Arabic', serif", fontSize: '28px' }}
      >
        {words.map((word, i) => (
          <span
            key={`${word.ayahNumber}-${word.wordIndex}`}
            className={cn(
              'inline mx-1 transition-colors duration-300',
              states[i] === 'correct' && 'text-green-600 dark:text-green-400',
              states[i] === 'wrong' && 'text-red-500 dark:text-red-400',
              states[i] === 'current' && 'text-blue-500 dark:text-blue-400 underline underline-offset-4',
              states[i] === 'idle' && 'text-foreground',
              i === currentIndex && states[i] === 'idle' && 'text-blue-500 dark:text-blue-400 underline underline-offset-4'
            )}
          >
            {word.arabic}
          </span>
        ))}
      </div>

      {/* Latin */}
      {latin && (
        <p className="text-sm text-muted-foreground text-left mt-2 leading-relaxed">
          {latin}
        </p>
      )}

      {/* Terjemahan */}
      {translation && (
        <p className="text-xs text-muted-foreground/70 text-left mt-1 italic">
          {translation}
        </p>
      )}
    </div>
  )
}