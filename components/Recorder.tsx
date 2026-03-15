"use client"

import { useState, useRef } from "react"

export default function Recorder(){

  const [recording,setRecording] = useState(false)
  const [result,setResult] = useState("")
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  async function startRecording(){

    const stream = await navigator.mediaDevices.getUserMedia({
      audio:true
    })

    const recorder = new MediaRecorder(stream)

    recorderRef.current = recorder
    chunksRef.current = []

    recorder.ondataavailable = e=>{
      chunksRef.current.push(e.data)
    }

    recorder.onstop = async ()=>{

      const blob = new Blob(chunksRef.current,{type:"audio/wav"})

      const formData = new FormData()
      formData.append("file",blob)

    const res = await fetch(
  "https://zqubndojitbslbbblllo.supabase.co/functions/v1/quran-ai",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    },
    body: formData
  }
)

      const data = await res.json()

      setResult(data.phoneme)
    }

    recorder.start()
    setRecording(true)
  }

  function stopRecording(){
    recorderRef.current?.stop()
    setRecording(false)
  }

  return(

    <div>

      {!recording && (
        <button
          onClick={startRecording}
          style={{padding:"12px 20px",fontSize:16}}
        >
          🎤 Start Recording
        </button>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          style={{padding:"12px 20px",fontSize:16}}
        >
          ⏹ Stop Recording
        </button>
      )}

      {recording && <p>Recording...</p>}

      {result && (
        <div style={{marginTop:20}}>
          <h3>AI Result</h3>
          <p>{result}</p>
        </div>
      )}

    </div>

  )
}