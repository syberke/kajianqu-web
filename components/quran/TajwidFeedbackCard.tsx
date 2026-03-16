// components/quran/TajwidFeedbackCard.tsx
// Komponen untuk menampilkan feedback tajwid detail dari Gemini
// Dipakai di halaman Tahfidz dan Tahsin

'use client'

import { Loader2, RefreshCw } from 'lucide-react'

export interface TajwidFeedback {
  skor_keseluruhan: number
  ringkasan: string
  mad: { nilai: string; catatan: string }
  makhraj: { nilai: string; catatan: string }
  ghunnah: { nilai: string; catatan: string }
  waqaf: { nilai: string; catatan: string }
  kelancaran: { nilai: string; catatan: string }
  saran_utama: string
}

interface Props {
  feedback: TajwidFeedback | null
  isLoading: boolean
  onRetry?: () => void
  accentColor?: 'blue' | 'emerald' // biru = tahfidz, hijau = tahsin
}

// Warna badge berdasarkan nilai
function nilaiStyle(nilai: string) {
  if (nilai === 'Baik') return 'bg-green-100 text-green-700'
  if (nilai === 'Perlu Diperbaiki') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-600'
}

function nilaiEmoji(nilai: string) {
  if (nilai === 'Baik') return '✅'
  if (nilai === 'Perlu Diperbaiki') return '⚠️'
  return '❌'
}

const ASPEK_LABELS: Record<string, string> = {
  mad: 'Mad (Panjang-Pendek)',
  makhraj: 'Makhrajul Huruf',
  ghunnah: 'Ghunnah (Dengung)',
  waqaf: 'Waqaf (Tanda Berhenti)',
  kelancaran: 'Kelancaran',
}

export default function TajwidFeedbackCard({ feedback, isLoading, onRetry, accentColor = 'emerald' }: Props) {
  const accent = accentColor === 'blue' ? 'blue' : 'emerald'

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-[40px] p-8 border border-${accent}-100 shadow-md`}>
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 size={32} className={`text-${accent}-500 animate-spin`} />
          <div className="text-center">
            <p className={`text-sm font-black text-${accent}-700`}>Ustadz AI sedang menganalisis...</p>
            <p className="text-xs text-gray-400 mt-1">Memeriksa mad, makhraj, ghunnah, dan waqaf</p>
          </div>
        </div>
      </div>
    )
  }

  if (!feedback) return null

  const aspekKeys = ['mad', 'makhraj', 'ghunnah', 'waqaf', 'kelancaran'] as const
  const skor = feedback.skor_keseluruhan

  return (
    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-md space-y-6">

      {/* Header skor */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Penilaian Ustadz AI
          </p>
          <h3 className="text-lg font-black text-gray-800">Evaluasi Tajwid</h3>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black ${skor >= 80 ? 'text-green-500' : skor >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {skor}
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase">dari 100</p>
        </div>
      </div>

      {/* Ringkasan */}
      <div className={`bg-${accent}-50 rounded-[24px] p-5`}>
        <p className={`text-sm font-medium text-${accent}-800 leading-relaxed italic`}>
          "{feedback.ringkasan}"
        </p>
      </div>

      {/* Aspek-aspek tajwid */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Per Aspek</p>

        {aspekKeys.map((key) => {
          const aspek = feedback[key]
          return (
            <div key={key} className="border border-gray-100 rounded-[20px] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-700">{ASPEK_LABELS[key]}</span>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${nilaiStyle(aspek.nilai)}`}>
                  {nilaiEmoji(aspek.nilai)} {aspek.nilai}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{aspek.catatan}</p>
            </div>
          )
        })}
      </div>

      {/* Saran utama */}
      <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-5">
        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">
          🎯 Fokus Latihan Berikutnya
        </p>
        <p className="text-sm font-medium text-amber-800 leading-relaxed">
          {feedback.saran_utama}
        </p>
      </div>

      {/* Tombol analisis ulang */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[20px] border-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} /> Analisis Ulang
        </button>
      )}
    </div>
  )
}