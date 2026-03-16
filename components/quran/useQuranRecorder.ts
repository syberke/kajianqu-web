// components/quran/useQuranRecorder.ts
// Versi final: realtime chunk ke Groq + expose finalAudioBlob untuk Gemini feedback

'use client'

import { useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface RecorderOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
  // Dipanggil saat rekam selesai, dengan full audio blob untuk analisis tajwid
  onFinalAudio?: (blob: Blob) => void
}

export function useQuranRecorder({ onTranscript, onError, onFinalAudio }: RecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const allChunksRef = useRef<Blob[]>([]) // simpan semua untuk final blob
  const isTranscribingRef = useRef(false)
  const mimeTypeRef = useRef('audio/webm')

  const transcribeBlob = useCallback(
    async (blob: Blob, isFinal: boolean) => {
      if (blob.size < 3000) return
      if (isTranscribingRef.current && !isFinal) return
      isTranscribingRef.current = true

      const formData = new FormData()
      formData.append('audio', blob, 'chunk.webm')

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const { data: { session } } = await supabase.auth.getSession()
        const bearerToken = session?.access_token ?? supabaseKey

        const res = await fetch(`${supabaseUrl}/functions/v1/transcribe-quran`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: formData,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
          if (isFinal) onError(err.error || 'Transkripsi gagal')
          return
        }

        const data = await res.json()
        if (data.text?.trim()) {
          onTranscript(data.text.trim(), isFinal)
        }
      } catch {
        if (isFinal) onError('Koneksi gagal saat transkripsi')
      } finally {
        isTranscribingRef.current = false
      }
    },
    [onTranscript, onError]
  )

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      allChunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      mimeTypeRef.current = mimeType
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          allChunksRef.current.push(e.data) // akumulasi semua
        }
      }

      mediaRecorder.onstop = async () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }

        // Final transkripsi
        if (chunksRef.current.length > 0) {
          const finalBlob = new Blob(chunksRef.current, { type: mimeType })
          chunksRef.current = []
          await transcribeBlob(finalBlob, true)
        }

        // Kirim full audio blob ke parent untuk analisis tajwid Gemini
        if (onFinalAudio && allChunksRef.current.length > 0) {
          const fullBlob = new Blob(allChunksRef.current, { type: mimeType })
          onFinalAudio(fullBlob)
        }
      }

      mediaRecorder.start(500)
      setIsRecording(true)

      // Kirim chunk tiap 3 detik untuk realtime transkripsi
      intervalRef.current = setInterval(() => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob([...chunksRef.current], { type: mimeType })
        transcribeBlob(blob, false)
      }, 3000)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
        onError('Izin mikrofon ditolak. Buka pengaturan browser → izinkan mikrofon → refresh.')
      } else if (msg.includes('NotFoundError')) {
        onError('Mikrofon tidak ditemukan.')
      } else {
        onError(`Gagal akses mikrofon: ${msg}`)
      }
    }
  }, [transcribeBlob, onError, onFinalAudio])

  const stopRecording = useCallback(async () => {
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  return { isRecording, startRecording, stopRecording }
}