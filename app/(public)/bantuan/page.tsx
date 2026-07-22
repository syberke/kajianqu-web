import Link from 'next/link'
import { Instagram, Mail, MessageCircle } from 'lucide-react'

export default function BantuanPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/6282262170018'
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/kajian_qu/'

  return <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-32">
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Pusat Bantuan</p>
    <h1 className="mt-3 text-4xl font-black text-slate-950">Ada yang bisa kami bantu?</h1>
    <p className="mt-4 max-w-2xl leading-7 text-slate-600">Hubungi tim KajianQu untuk kendala akun, kelas, donasi, atau penggunaan Quran AI.</p>
    <div className="mt-10 grid gap-5 sm:grid-cols-3">
      <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300"><MessageCircle className="text-emerald-700" /><h2 className="mt-5 font-black">WhatsApp</h2><p className="mt-2 text-sm text-slate-500">0822-6217-0018</p></a>
      <a href={instagram} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300"><Instagram className="text-emerald-700" /><h2 className="mt-5 font-black">Instagram</h2><p className="mt-2 text-sm text-slate-500">@kajian_qu</p></a>
      <Link href="/welcome" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300"><Mail className="text-emerald-700" /><h2 className="mt-5 font-black">Panduan</h2><p className="mt-2 text-sm text-slate-500">Kembali ke beranda</p></Link>
    </div>
  </main>
}
