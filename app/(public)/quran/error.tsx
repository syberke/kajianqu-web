'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'

export default function QuranError({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#f7faf8] px-4 pt-24">
      <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto text-red-500" size={36} />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Data Qur&apos;an belum bisa dimuat</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Periksa koneksi server ke Quran API lalu coba lagi. Halaman tidak menggunakan data ayat fallback atau dummy.</p>
        <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1a7a53] px-5 py-3 font-semibold text-white"><RotateCcw size={17} />Coba lagi</button>
      </div>
    </div>
  )
}
