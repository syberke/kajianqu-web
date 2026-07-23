'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[70vh] place-items-center bg-[#f6faf8] px-6"><div className="max-w-lg text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-100 text-amber-700"><AlertTriangle size={36} /></span><h1 className="mt-8 text-3xl font-black text-slate-950">Layanan sedang tidak dapat dimuat</h1><p className="mt-4 leading-7 text-slate-500">Periksa koneksi lalu coba kembali. Data Anda tidak berubah.</p><button onClick={reset} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#064E3B] px-6 py-3 font-bold text-white"><RefreshCw size={18} />Coba Lagi</button></div></main>
}
