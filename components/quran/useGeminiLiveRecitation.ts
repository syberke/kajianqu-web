'use client'

import { useCallback, useRef, useState } from 'react'

import { GEMINI_LIVE_SYSTEM_INSTRUCTION } from '@/lib/gemini-live-config'

interface GeminiLiveTokenResponse {
  token: string
  model: string
}

interface GeminiServerMessage {
  setupComplete?: Record<string, never>
  serverContent?: {
    inputTranscription?: { text?: string }
    turnComplete?: boolean
  }
  goAway?: { timeLeft?: string }
}

interface UseGeminiLiveRecitationOptions {
  onTranscript: (transcript: string) => void
  onError: (message: string) => void
}

export interface RecitationRecordingResult {
  transcript: string
  audioBlob: Blob | null
  mimeType: string
}

const LIVE_ENDPOINT =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained'
const TARGET_SAMPLE_RATE = 16_000

function mergeTranscript(current: string, incoming: string): string {
  const next = incoming.trim()
  const previous = current.trim()
  if (!next) return previous
  if (!previous) return next
  if (next === previous || previous.endsWith(next)) return previous
  if (next.startsWith(previous)) return next

  const maxOverlap = Math.min(previous.length, next.length)
  for (let size = maxOverlap; size >= 3; size -= 1) {
    if (previous.slice(-size) === next.slice(0, size)) {
      return `${previous}${next.slice(size)}`.replace(/\s+/g, ' ').trim()
    }
  }

  return `${previous} ${next}`.replace(/\s+/g, ' ').trim()
}

function downsampleTo16k(input: Float32Array, sourceRate: number): Int16Array {
  if (sourceRate === TARGET_SAMPLE_RATE) {
    return Int16Array.from(input, (sample) => {
      const clamped = Math.max(-1, Math.min(1, sample))
      return clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
    })
  }

  const ratio = sourceRate / TARGET_SAMPLE_RATE
  const outputLength = Math.max(1, Math.round(input.length / ratio))
  const output = new Int16Array(outputLength)

  for (let index = 0; index < outputLength; index += 1) {
    const start = Math.floor(index * ratio)
    const end = Math.min(input.length, Math.floor((index + 1) * ratio))
    let total = 0
    let count = 0
    for (let sourceIndex = start; sourceIndex < end; sourceIndex += 1) {
      total += input[sourceIndex]
      count += 1
    }
    const sample = Math.max(-1, Math.min(1, count > 0 ? total / count : input[start] ?? 0))
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  return output
}

function pcmToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function getPreferredRecordingMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? ''
}

export function useGeminiLiveRecitation({
  onTranscript,
  onError,
}: UseGeminiLiveRecitationOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordedAudioRef = useRef<Blob | null>(null)
  const transcriptRef = useRef('')
  const resolveStopRef = useRef<((result: RecitationRecordingResult) => void) | null>(null)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishingRef = useRef(false)

  const stopMediaRecorder = useCallback(async (): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return recordedAudioRef.current
    if (recorder.state === 'inactive') return recordedAudioRef.current

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = audioChunksRef.current.length > 0
          ? new Blob(audioChunksRef.current, { type: mimeType })
          : null
        recordedAudioRef.current = blob
        resolve(blob)
      }
      recorder.stop()
    })
  }, [])

  const cleanupAudio = useCallback(async () => {
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    processorRef.current = null
    sourceRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close().catch(() => undefined)
    }
    audioContextRef.current = null
  }, [])

  const completeStop = useCallback(async () => {
    if (finishingRef.current) return
    finishingRef.current = true

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    const audioBlob = await stopMediaRecorder().catch(() => recordedAudioRef.current)
    const mimeType = audioBlob?.type || mediaRecorderRef.current?.mimeType || 'audio/webm'
    await cleanupAudio()
    socketRef.current?.close(1000, 'recitation finished')
    socketRef.current = null
    setIsRecording(false)
    setIsConnecting(false)
    resolveStopRef.current?.({
      transcript: transcriptRef.current,
      audioBlob,
      mimeType,
    })
    resolveStopRef.current = null
    finishingRef.current = false
  }, [cleanupAudio, stopMediaRecorder])

  const startRecording = useCallback(async () => {
    if (isRecording || isConnecting) return false
    setIsConnecting(true)
    transcriptRef.current = ''
    audioChunksRef.current = []
    recordedAudioRef.current = null
    finishingRef.current = false
    onTranscript('')

    try {
      const tokenResponse = await fetch('/api/ai/gemini-live-token', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      })

      if (!tokenResponse.ok) {
        const payload = (await tokenResponse.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Tidak bisa membuka sesi Gemini Live')
      }

      const { token, model } = (await tokenResponse.json()) as GeminiLiveTokenResponse
      const socket = new WebSocket(`${LIVE_ENDPOINT}?access_token=${encodeURIComponent(token)}`)
      socketRef.current = socket

      await new Promise<void>((resolve, reject) => {
        const setupTimeout = setTimeout(() => reject(new Error('Gemini Live tidak merespons')), 12_000)

        socket.onopen = () => {
          socket.send(
            JSON.stringify({
              setup: {
                model: `models/${model}`,
                responseModalities: ['AUDIO'],
                inputAudioTranscription: {},
                systemInstruction: {
                  parts: [{ text: GEMINI_LIVE_SYSTEM_INSTRUCTION }],
                },
              },
            }),
          )
        }

        socket.onmessage = (event) => {
          const message = JSON.parse(String(event.data)) as GeminiServerMessage
          if (message.setupComplete) {
            clearTimeout(setupTimeout)
            resolve()
            return
          }

          const text = message.serverContent?.inputTranscription?.text
          if (text) {
            transcriptRef.current = mergeTranscript(transcriptRef.current, text)
            onTranscript(transcriptRef.current)
          }

          if (message.serverContent?.turnComplete && resolveStopRef.current) {
            void completeStop()
          }
        }

        socket.onerror = () => {
          clearTimeout(setupTimeout)
          reject(new Error('Koneksi WebSocket Gemini Live gagal'))
        }

        socket.onclose = () => {
          if (resolveStopRef.current) void completeStop()
        }
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      if (typeof MediaRecorder !== 'undefined') {
        const mimeType = getPreferredRecordingMimeType()
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data)
        }
        recorder.start(1_000)
        mediaRecorderRef.current = recorder
      }

      const AudioContextClass = window.AudioContext
      const audioContext = new AudioContextClass({ latencyHint: 'interactive' })
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      sourceRef.current = source
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        const socketNow = socketRef.current
        if (!socketNow || socketNow.readyState !== WebSocket.OPEN) return
        const floatSamples = event.inputBuffer.getChannelData(0)
        const pcm = downsampleTo16k(floatSamples, audioContext.sampleRate)
        socketNow.send(
          JSON.stringify({
            realtimeInput: {
              audio: {
                data: pcmToBase64(pcm),
                mimeType: `audio/pcm;rate=${TARGET_SAMPLE_RATE}`,
              },
            },
          }),
        )
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      setIsConnecting(false)
      setIsRecording(true)
      return true
    } catch (error) {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      await cleanupAudio()
      socketRef.current?.close()
      socketRef.current = null
      setIsConnecting(false)
      setIsRecording(false)

      const message = error instanceof Error ? error.message : 'Gagal membuka mikrofon'
      if (message.includes('Permission') || message.includes('NotAllowedError')) {
        onError('Izin mikrofon ditolak. Izinkan mikrofon di browser lalu coba lagi.')
      } else {
        onError(message)
      }
      return false
    }
  }, [cleanupAudio, completeStop, isConnecting, isRecording, onError, onTranscript])

  const stopRecording = useCallback(async (): Promise<RecitationRecordingResult> => {
    if (!socketRef.current || !isRecording) {
      return {
        transcript: transcriptRef.current,
        audioBlob: recordedAudioRef.current,
        mimeType: recordedAudioRef.current?.type || 'audio/webm',
      }
    }

    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    setIsRecording(false)

    return new Promise<RecitationRecordingResult>((resolve) => {
      resolveStopRef.current = resolve
      socketRef.current?.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }))
      stopTimerRef.current = setTimeout(() => void completeStop(), 2_500)
    })
  }, [completeStop, isRecording])

  const resetTranscript = useCallback(() => {
    transcriptRef.current = ''
    onTranscript('')
  }, [onTranscript])

  return {
    isRecording,
    isConnecting,
    startRecording,
    stopRecording,
    resetTranscript,
  }
}
