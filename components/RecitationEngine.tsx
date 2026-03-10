'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Mic, Square, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  surahIndex: number;
  mode: 'tahsin' | 'tahfidz';
  verses: string[]; // Teks Arab per ayat
}

export default function RecitationEngine({ surahIndex, mode, verses }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [correctionData, setCorrectionData] = useState({ verseIndex: 1, wordIndex: 0 });
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Inisialisasi WebSocket
  useEffect(() => {
    const API_KEY = process.env.NEXT_PUBLIC_QURANI_API_KEY;
    const socket = new WebSocket(`wss://api.qurani.ai?api_key=${API_KEY}`);

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.event === "start_tilawa_session") {
        setSessionStarted(true);
      } else if (response.event === "check_tilawa") {
        setCorrectionData({
          verseIndex: response.verse_index,
          wordIndex: response.word_index
        });
      }
    };

    socketRef.current = socket;
    return () => socket.close();
  }, []);

  // 2. Fungsi Memulai Sesi AI
  const startAiSession = (vIndex: number) => {
    const payload = {
      method: "StartTilawaSession",
      chapter_index: surahIndex,
      verse_index: vIndex,
      word_index: 1,
      hafz_level: mode === 'tahfidz' ? 3 : 1, // Tahfidz lebih ketat
      tajweed_level: 3,
    };
    socketRef.current?.send(JSON.stringify(payload));
  };

  // 3. Fungsi Recording (Kirim data ke AI)
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        // AI membutuhkan format Opus/Raw Buffer
        const buffer = await event.data.arrayBuffer();
        socketRef.current.send(buffer);
      }
    };

    mediaRecorder.start(100); // Kirim data setiap 100ms untuk real-time
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 4. Logika Alur Tahsin vs Tahfidz
  const handleAction = () => {
    if (mode === 'tahsin') {
      // Jalankan Audio dulu
      setIsPlayingAudio(true);
      audioRef.current?.play();
      
      // Saat audio selesai, otomatis rekam
      audioRef.current!.onended = () => {
        setIsPlayingAudio(false);
        startAiSession(1);
        startRecording();
      };
    } else {
      // Tahfidz: Langsung Rekam
      startAiSession(1);
      startRecording();
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Tombol Kontrol Sesuai Gambar Referensi */}
      <div className="flex justify-center gap-4">
        {mode === 'tahsin' && (
          <button 
            onClick={handleAction}
            disabled={isPlayingAudio || isRecording}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all"
          >
            <Volume2 size={20} /> Simak & Ikuti
          </button>
        )}
        
        <button 
          onClick={isRecording ? stopRecording : handleAction}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${
            isRecording ? 'bg-red-500' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isRecording ? <Square size={20} /> : <Mic size={20} />}
          {isRecording ? 'Berhenti' : mode === 'tahfidz' ? 'Mulai Setoran' : 'Mulai Baca'}
        </button>

        <button className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Area Teks Arab dengan Highlight Real-time */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm text-center">
        <div className="flex flex-wrap justify-center gap-4 transition-all" dir="rtl">
          {verses.map((verse, vIdx) => (
            <div key={vIdx} className="mb-6">
              <p className="text-4xl leading-[2.5] font-arabic">
                {verse.split(" ").map((word, wIdx) => {
                  const isCorrect = (correctionData.verseIndex > vIdx + 1) || 
                                   (correctionData.verseIndex === vIdx + 1 && correctionData.wordIndex > wIdx);
                  return (
                    <span 
                      key={wIdx} 
                      className={`transition-colors duration-300 ${isCorrect ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}
                    >
                      {word}{" "}
                    </span>
                  );
                })}
              </p>
            </div>
          ))}
        </div>
        
        {isRecording && (
          <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 font-black animate-pulse">
            <Sparkles size={16} />
            <span className="text-xs uppercase tracking-[0.2em]">AI sedang mengoreksi bacaanmu...</span>
          </div>
        )}
      </div>

      <audio ref={audioRef} src={`https://server8.mp3quran.net/afs/001.mp3`} />
    </div>
  );
}