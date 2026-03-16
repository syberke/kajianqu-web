// components/quran/useTajwidFeedback.ts
// Hook untuk memanggil API feedback tajwid detail dari Gemini
// Dipanggil SETELAH user selesai rekam, bukan saat realtime

'use client'

import { useState, useCallback, useRef } from 'react'
import { TajwidFeedback } from './TajwidFeedbackCard'

interface Options {
  surahName: string
  ayahStart: number
  ayahEnd: number
  mode: 'tahfidz' | 'tahsin'
}

export function useTajwidFeedback() {
  const [feedback, setFeedback] = useState<TajwidFeedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Simpan audio blob terakhir supaya bisa "analisis ulang"
  const lastBlobRef = useRef<Blob | null>(null)
  const lastOptionsRef = useRef<Options | null>(null)

  const analyze = useCallback(async (audioBlob: Blob, options: Options) => {
    if (!audioBlob || audioBlob.size < 1000) return

    lastBlobRef.current = audioBlob
    lastOptionsRef.current = options

    setIsLoading(true)
    setFeedback(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('surahName', options.surahName)
      formData.append('ayahStart', String(options.ayahStart))
      formData.append('ayahEnd', String(options.ayahEnd))
      formData.append('mode', options.mode)

      const res = await fetch('/api/tajwid-feedback', {
        method: 'POST',
        body: formData,
      })

      if (res.status === 429) {
        setError('AI sedang sibuk, coba lagi sebentar')
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Gagal mendapat feedback')
        return
      }

      const data: TajwidFeedback = await res.json()
      setFeedback(data)
    } catch {
      setError('Koneksi gagal saat menganalisis')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Analisis ulang dengan audio yang sama
  const retry = useCallback(() => {
    if (lastBlobRef.current && lastOptionsRef.current) {
      analyze(lastBlobRef.current, lastOptionsRef.current)
    }
  }, [analyze])

  const reset = useCallback(() => {
    setFeedback(null)
    setError(null)
    lastBlobRef.current = null
  }, [])

  return { feedback, isLoading, error, analyze, retry, reset }
}