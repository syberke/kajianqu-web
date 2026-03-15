'use client'

import React, { useState, useRef } from 'react'
import { DeepgramClient } from "@deepgram/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const alfatiha = [
  "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
  "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
  "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
  "مَٰلِكِ يَوۡمِ ٱلدِّينِ"
];

export default function TahfidzV5Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeVerse, setActiveVerse] = useState(0);
  const [aiText, setAiText] = useState("");
  const [status, setStatus] = useState("Siap (SDK v5 Final)");
  
  const initialStatuses = alfatiha.map(verse => verse.split(" ").map(() => "pending"));
  const [wordStatuses, setWordStatuses] = useState(initialStatuses);
  const [ustadzReview, setUstadzReview] = useState("");
  const [skor, setSkor] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [finalAudioBlob, setFinalAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<any>(null);
  const keepAliveRef = useRef<any>(null);

  const cleanArabic = (text: string) => {
    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, "").replace(/[إأآا]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();
  };

  const matchTahfidz = (transcript: string) => {
    const targetWords = alfatiha[activeVerse].split(" ");
    const aiWords = transcript.split(" ");
    let tempStatuses = [...wordStatuses[activeVerse]];

    aiWords.forEach(aiW => {
      const cleanedAI = cleanArabic(aiW);
      if (cleanedAI.length < 2) return;
      targetWords.forEach((targetW, idx) => {
        if (cleanArabic(targetW) === cleanedAI) tempStatuses[idx] = "correct";
      });
    });

    setWordStatuses(prev => {
      const next = [...prev];
      next[activeVerse] = tempStatuses;
      return next;
    });

    if (tempStatuses.filter(s => s === "correct").length >= targetWords.length && activeVerse < alfatiha.length - 1) {
      setTimeout(() => { setActiveVerse(v => v + 1); setAiText(""); }, 1500);
    }
  };

  const startNgaji = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
     const deepgram = new DeepgramClient({ apiKey: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY ?? "" });

      // STEP 2: Menggunakan v1.connect sesuai dokumentasi v5
      const connection = await deepgram.listen.v1.connect({
        model: "nova-3",
        language: "ar",
        smart_format: "true",
        interim_results: "true",
        Authorization: `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY ?? ""}`,
      });

      connectionRef.current = connection;
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);

      connection.on("open", () => {
        setIsRecording(true);
        setStatus("🔴 Merekam...");

        // Keep Alive Interval
        keepAliveRef.current = setInterval(() => {
          connection.sendKeepAlive({ type: "KeepAlive" });
        }, 3000);

        // STEP 3: Listen for "message" event
        connection.on("message", (data: any) => {
          if (data.type === "Results") {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
              setAiText(transcript);
              matchTahfidz(transcript);
            }
          }
        });

        connection.on("error", (err: any) => console.error(err));
        connection.on("close", () => {
          clearInterval(keepAliveRef.current);
          setStatus("Koneksi ditutup.");
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
         if (connection.readyState === 1) {
              // STEP 4: Menggunakan sendMedia
              connection.sendMedia(e.data);
            }
          }
        };
        recorder.start(250);
      });

      recorder.onstop = () => {
        setFinalAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
      };

      mediaRecorderRef.current = recorder;
      
      // Inisialisasi koneksi
      connection.connect();
      await connection.waitForOpen();

    } catch (err) {
      console.error(err);
      setStatus("Gagal inisialisasi Mic/SDK.");
    }
  };

const stopNgaji = () => {
  mediaRecorderRef.current?.stop();
  
  // Kirim CloseStream message sebelum menutup koneksi
  if (connectionRef.current) {
    connectionRef.current.sendMedia(
      JSON.stringify({ type: "CloseStream" })
    );
  }
  
  setIsRecording(false);
};

  const getGeminiReview = async () => {
    if (!finalAudioBlob) return;
    setIsReviewing(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const arrayBuffer = await finalAudioBlob.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const prompt = `Analisis bacaan Al-Fatihah ini. Berikan skor (0-100) dan nasihat tajwid singkat dalam JSON: {"skor": 0, "nasihat": "", "motivasi": ""}`;
      const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: "audio/webm" } }]);
      const responseText = result.response.text();
      const jsonStr = responseText.replace(/```json|```/g, "").trim();
      const reviewObj = JSON.parse(jsonStr);
      setSkor(reviewObj.skor);
      setUstadzReview(`${reviewObj.nasihat}\n\n${reviewObj.motivasi}`);
    } catch (err) { setUstadzReview("Gagal review."); } finally { setIsReviewing(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-black italic">KAJAN<span className="text-emerald-600">QU</span></h1>
          <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest">{status}</p>
        </header>

        <div className="bg-white shadow-xl rounded-[3rem] p-12 border border-slate-100 relative overflow-hidden">
          {skor !== null && (
            <div className="absolute top-8 left-8 bg-emerald-600 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white animate-bounce">
              <span className="text-[10px] font-bold uppercase">Skor</span>
              <span className="text-2xl font-black">{skor}</span>
            </div>
          )}
          <div dir="rtl" className="text-4xl md:text-5xl leading-[5rem] text-right font-arabic">
            {alfatiha.map((verse, vIdx) => (
              vIdx <= activeVerse && (
                <p key={vIdx} className="mb-4">
                  {verse.split(" ").map((word, wIdx) => (
                    <span key={wIdx} className={`mx-1 transition-all ${wordStatuses[vIdx][wIdx] === 'correct' ? 'text-emerald-500 font-bold' : 'text-slate-200'}`}>
                      {word}
                    </span>
                  ))}
                </p>
              )
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-emerald-400 p-6 rounded-3xl text-center text-xl font-arabic" dir="rtl">
          {aiText || "Mulai mengaji..."}
        </div>

        <div className="flex justify-center">
          <button onClick={isRecording ? stopNgaji : startNgaji} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}>
            {isRecording ? <div className="w-8 h-8 bg-white rounded-lg" /> : <span className="text-white text-4xl">🎤</span>}
          </button>
        </div>

        {finalAudioBlob && !isRecording && (
          <div className="bg-white border-2 border-emerald-50 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-lg tracking-tighter">Evaluasi Ustadz</h3>
              <button onClick={getGeminiReview} disabled={isReviewing} className="bg-emerald-600 text-white px-6 py-2 rounded-2xl text-sm font-black hover:bg-emerald-700 disabled:bg-slate-200">
                {isReviewing ? "Menilai..." : "Minta Penilaian"}
              </button>
            </div>
            {ustadzReview && <div className="text-slate-700 text-sm whitespace-pre-wrap bg-emerald-50/50 p-6 rounded-2xl">{ustadzReview}</div>}
          </div>
        )}
      </div>
    </div>
  )
}