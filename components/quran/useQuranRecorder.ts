// components/quran/useQuranRecorder.ts
'use client'

import { useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface RecorderOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
}

export function useQuranRecorder({ onTranscript, onError }: RecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const transcribe = useCallback(
    async (blob: Blob) => {
      if (blob.size < 500) return

      console.log('Sending audio blob:', blob.size, 'bytes', blob.type)

      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

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
          onError(err.error || 'Transkripsi gagal')
          return
        }

        const data = await res.json()
        if (data.text?.trim()) {
          onTranscript(data.text.trim(), true)
        }
      } catch {
        onError('Koneksi gagal saat transkripsi')
      }
    },
    [onTranscript, onError]
  )

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      // Gunakan audio/webm tanpa codecs suffix
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      // Kumpulkan semua chunks — kirim saat stop
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        chunksRef.current = []
        await transcribe(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
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
  }, [transcribe, onError])

  const stopRecording = useCallback(async () => {
    setIsRecording(false)
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop() // ini trigger onstop → transcribe otomatis
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  return { isRecording, startRecording, stopRecording }
}