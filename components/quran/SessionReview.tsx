// components/quran/SessionReview.tsx
'use client'

import { SessionMistake } from '@/types/quran'
import { CheckCircle2, XCircle, RotateCcw, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  totalWords: number
  correctWords: number
  mistakes: SessionMistake[]
  durationSeconds?: number
  onRetry: () => void
  onClose?: () => void
}

export function SessionReview({ totalWords, correctWords, mistakes, durationSeconds, onRetry, onClose }: Props) {
  const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0
  const wrongWords = totalWords - correctWords

  const getAccuracyColor = () => {
    if (accuracy >= 90) return 'text-green-600 dark:text-green-400'
    if (accuracy >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  const getAccuracyLabel = () => {
    if (accuracy >= 90) return 'Luar Biasa!'
    if (accuracy >= 70) return 'Bagus!'
    if (accuracy >= 50) return 'Perlu Latihan'
    return 'Terus Semangat!'
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BookOpen size={16} />
          Hasil Sesi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skor utama */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className={`text-3xl font-semibold ${getAccuracyColor()}`}>{accuracy}%</p>
            <p className="text-sm text-muted-foreground mt-0.5">{getAccuracyLabel()}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 justify-end">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-sm">{correctWords} benar</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <XCircle size={14} className="text-red-500" />
              <span className="text-sm">{wrongWords} salah</span>
            </div>
            {durationSeconds && (
              <p className="text-xs text-muted-foreground">{formatDuration(durationSeconds)}</p>
            )}
          </div>
        </div>

        {/* Daftar kesalahan */}
        {mistakes.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Kata yang perlu diperbaiki
            </p>
            <div className="space-y-2">
              {mistakes.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                  <span
                    className="text-red-700 dark:text-red-400 text-xl"
                    style={{ fontFamily: "'Scheherazade New', serif", direction: 'rtl' }}
                  >
                    {m.wordArabic}
                  </span>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Kamu baca: {m.wordSpoken || '(tidak terdengar)'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-0.5">Ayat {m.ayahNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
            <CheckCircle2 size={16} className="text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">Sempurna! Tidak ada kesalahan.</p>
          </div>
        )}

        {/* Tombol aksi */}
        <div className="flex gap-2 pt-1">
          <Button onClick={onRetry} variant="outline" size="sm" className="flex-1 gap-1.5">
            <RotateCcw size={14} />
            Ulangi
          </Button>
          {onClose && (
            <Button onClick={onClose} size="sm" className="flex-1">
              Selesai
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}