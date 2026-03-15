// components/quran/useQuranRecorder.ts
'use client'

import { useRef, useState, useCallback } from 'react'

interface RecorderOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
}

export function useQuranRecorder({ onTranscript, onError }: RecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const transcribeChunk = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return // terlalu kecil, skip

    const formData = new FormData()
    formData.append('audio', blob, 'audio.webm')
    formData.append('language', 'ar')

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/transcribe-quran`, {
        method: 'POST',
        headers: { apikey: supabaseKey! },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        onError(err.error || 'Transcription failed')
        return
      }

      const data = await res.json()
      if (data.text?.trim()) {
        onTranscript(data.text.trim(), true)
      }
    } catch (err) {
      onError('Network error during transcription')
    }
  }, [onTranscript, onError])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(3000) // kumpulkan chunks setiap 3 detik
      setIsRecording(true)

      // Kirim chunk ke Whisper setiap 4 detik
      intervalRef.current = setInterval(() => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
        chunksRef.current = []
        transcribeChunk(blob)
      }, 4000)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
        onError('Izin mikrofon ditolak. Buka pengaturan browser dan izinkan akses mikrofon.')
      } else if (message.includes('NotFoundError')) {
        onError('Mikrofon tidak ditemukan di perangkat ini.')
      } else {
        onError(`Gagal mengakses mikrofon: ${message}`)
      }
    }
  }, [transcribeChunk, onError])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRecording(false)

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        streamRef.current?.getTracks().forEach(t => t.stop())
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        chunksRef.current = []
        streamRef.current?.getTracks().forEach(t => t.stop())
        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  return { isRecording, startRecording, stopRecording }
}