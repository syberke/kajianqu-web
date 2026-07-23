import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f6faf8] px-6"><div className="max-w-lg text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-100 text-emerald-800"><SearchX size={36} /></span><p className="mt-8 text-sm font-black uppercase tracking-[0.25em] text-emerald-700">404</p><h1 className="mt-3 text-4xl font-black text-slate-950">Halaman tidak ditemukan</h1><p className="mt-4 leading-7 text-slate-500">Tautan mungkin sudah berubah atau halaman tidak lagi tersedia.</p><Link href="/welcome" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#064E3B] px-6 py-3 font-bold text-white"><ArrowLeft size={18} />Kembali ke Beranda</Link></div></main>
}
