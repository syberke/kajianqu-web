'use client'
import { useState, useRef } from 'react'

const AL_FATIHAH = [
  { id: 1, text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" },
  { id: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
  { id: 3, text: "الرَّحْمَنِ الرَّحِيمِ" },
  { id: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
  { id: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
  { id: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
  { id: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
];

export default function KajianQuLive() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Siap Mengaji");
  const [currentAyah, setCurrentAyah] = useState(1);
  const [fullTranscript, setFullTranscript] = useState("");
  const [latestFeedback, setLatestFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus("🔴 Menyimak...");
      setFullTranscript("");

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 5000) {
          sendChunkToGemini(e.data);
        }
      };

      // Set interval 20 detik sebagai backup
      recorder.start(20000); 
    } catch (err) {
      alert("Gagal akses microphone!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // Memicu ondataavailable terakhir secara instan
      setIsRecording(false);
      setStatus("Analisis Terakhir...");
    }
  };

  const sendChunkToGemini = async (blob: Blob) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("audio", blob);
    formData.append("currentAyahIndex", currentAyah.toString());

    try {
      const res = await fetch("/api/gemini-quran-realtime", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.text) setFullTranscript(data.text);
      if (data.feedback) setLatestFeedback(data.feedback);
      
      // Jika AI mendeteksi ayat selesai, lanjut ke ayat berikutnya
      if (data.isAyahComplete && currentAyah < 7) {
        setCurrentAyah(prev => prev + 1);
      }
    } catch (e) {
      console.error("Gagal mengirim ke AI");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-6 font-sans text-slate-900">
      <div className="max-w-2xl w-full space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-800">
            KAJAN<span className="text-emerald-600">QU</span> LIVE
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">{status}</p>
        </header>

        {/* MUSHAF CARD */}
        <div className="bg-white shadow-2xl p-10 rounded-[3rem] border border-emerald-50 relative min-h-[420px] flex flex-col">
          {isProcessing && (
            <div className="absolute top-6 right-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black text-slate-300 uppercase">Analisis AI</span>
            </div>
          )}

          <div dir="rtl" className="space-y-5 text-right flex-grow">
            {AL_FATIHAH.map((ayah) => (
              <p key={ayah.id} className={`text-2xl md:text-3xl leading-relaxed font-arabic transition-all duration-700 ${
                ayah.id === currentAyah ? "text-emerald-600 font-bold scale-105" :
                ayah.id < currentAyah ? "text-slate-300" : "text-slate-100"
              }`}>
                {ayah.text} <span className="text-xs opacity-20">({ayah.id})</span>
              </p>
            ))}
          </div>
        </div>

        {/* LIVE TRANSCRIPT */}
        <div className="bg-slate-900 p-6 rounded-[2rem] text-center shadow-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Apa yang AI dengar:</p>
          <p dir="rtl" className="text-xl text-emerald-400 font-arabic italic h-8 overflow-hidden">
            {fullTranscript || "..."}
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600 hover:scale-105 shadow-emerald-200'
            }`}
          >
            {isRecording ? <div className="w-8 h-8 bg-white rounded-sm" /> : <span className="text-white text-4xl">🎤</span>}
          </button>
          
          {latestFeedback && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center max-w-sm">
              <p className="text-emerald-800 italic text-xs leading-relaxed">"{latestFeedback}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}