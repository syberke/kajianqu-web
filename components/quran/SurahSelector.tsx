// components/quran/SurahSelector.tsx
'use client'

import { SURAH_LIST } from '@/lib/quran-data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  surahId: number
  ayahStart: number
  ayahEnd: number
  onSurahChange: (id: number) => void
  onAyahStartChange: (n: number) => void
  onAyahEndChange: (n: number) => void
  disabled?: boolean
}

export function SurahSelector({
  surahId, ayahStart, ayahEnd,
  onSurahChange, onAyahStartChange, onAyahEndChange,
  disabled = false,
}: Props) {
  const surah = SURAH_LIST.find(s => s.id === surahId)
  const totalAyat = surah?.totalAyat ?? 7

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Surah</Label>
        <Select
          value={String(surahId)}
          onValueChange={(v) => onSurahChange(Number(v))}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SURAH_LIST.map(s => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Dari ayat</Label>
        <Select
          value={String(ayahStart)}
          onValueChange={(v) => onAyahStartChange(Number(v))}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalAyat }, (_, i) => i + 1).map(n => (
              <SelectItem key={n} value={String(n)}>Ayat {n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Sampai ayat</Label>
        <Select
          value={String(ayahEnd)}
          onValueChange={(v) => onAyahEndChange(Number(v))}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalAyat }, (_, i) => i + 1)
              .filter(n => n >= ayahStart)
              .map(n => (
                <SelectItem key={n} value={String(n)}>Ayat {n}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}