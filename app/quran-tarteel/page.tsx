'use client'

import React, { useState, useRef } from 'react'

export default function TahfidzApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Siap Mengaji");
  const [text, setText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        sendToPython(audioBlob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus("🔴 Mendengarkan...");
      setText("");
    } catch (err) {
      alert("Akses Mic ditolak!");
    }
  };

  const sendToPython = async (blob: Blob) => {
    setStatus("⏳ Sedang memproses bacaan...");
    const formData = new FormData();
    formData.append("audio", blob);

    try {
      const res = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setText(data.text);
        setStatus("Selesai!");
      } else {
        setStatus("Gagal: " + data.error);
      }
    } catch (e) {
      setStatus("Server Python Belum Jalan!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-8 text-center">
        <h1 className="text-3xl font-black italic text-emerald-600">KAJIAN<span className="text-slate-800">QU</span> AI</h1>
        
        <div className="bg-slate-900 text-emerald-400 p-10 rounded-3xl min-h-[150px] flex items-center justify-center text-3xl font-arabic shadow-inner" dir="rtl">
          {text || (isRecording ? "..." : "Hasil bacaan muncul di sini")}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={isRecording ? () => mediaRecorderRef.current?.stop() : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isRecording ? <div className="w-8 h-8 bg-white rounded-lg" /> : <span className="text-white text-4xl">🎤</span>}
          </button>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{status}</p>
        </div>
      </div>
    </div>
  )
}