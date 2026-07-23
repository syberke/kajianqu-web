'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle2, ChevronRight } from 'lucide-react'

const NOMINALS = [10000, 25000, 50000, 100000, 150000]
const PAYMENT_METHODS = ['Transfer Bank (BCA)', 'Transfer Bank (BNI)', 'Transfer Bank (BSI)', 'GoPay', 'OVO', 'Dana', 'QRIS']

const imgBg       = "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1400"
const imgEAbsensi = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
const imgCBT      = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
const imgIconStar = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"

export default function InfaqAsatidzPage() {
  const router = useRouter()
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null)
  const [customNominal, setCustomNominal]     = useState('')
  const [paymentMethod, setPaymentMethod]     = useState('')
  const [copied, setCopied]                   = useState(false)

  const formatRupiah = (n: string | number) =>
    n.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const handleCopy = () => {
    navigator.clipboard.writeText('08121323111')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDonasi = () => {
    if (!selectedNominal && !customNominal) return alert('Pilih nominal terlebih dahulu')
    if (!paymentMethod) return alert('Pilih metode pembayaran')
    const nominal = selectedNominal ?? Number(customNominal.replace(/\D/g, ''))
    router.push(`/dashboard/siswa/donation?category=infaq-asatidz&nominal=${nominal}`)
  }

  return (
    <div className="bg-[#f8fffe] min-h-screen font-['Poppins',sans-serif]">

      {/* HERO */}
      <section className="relative text-white pt-32 pb-24 px-6 overflow-hidden flex items-center justify-center min-h-[350px]">
        <div className="absolute inset-0 z-0">
          <img src={imgBg} alt="Infaq Asatidz" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0d5c3a]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d5c3a]/95 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10 mt-6">
          <p className="text-[#d3ad0f] text-sm font-bold uppercase tracking-widest">Program Donasi</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">Infaq Asatidz</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-[14px] md:text-[16px] leading-relaxed">
            Perbanyak pahala dengan amal jariyah melalui program Wakaf Al-Qur&apos;an dan dukungan untuk para Asatidz.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20 mt-[-50px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-8">

          {/* FORM DONASI */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">

              {/* NO REKENING */}
              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">No. Rekening</label>
                <div className="flex items-center justify-between p-4 md:p-5 bg-[#e8f5ee] border border-[#157a52]/20 rounded-[20px]">
                  <span className="text-[#0c1421] font-bold text-[22px] md:text-[24px] tracking-wider">08121323111</span>
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-white text-[#157a52] rounded-[10px] border border-gray-200 hover:bg-[#157a52] hover:text-white transition-all shadow-sm font-bold text-[13px]">
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    <span className="hidden sm:inline">{copied ? 'Berhasil' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* NOMINAL */}
              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">Pilih Nominal</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {NOMINALS.map(n => (
                    <button key={n} onClick={() => { setSelectedNominal(n); setCustomNominal('') }}
                      className={`p-3.5 border-2 rounded-[16px] text-[14px] font-bold transition-all ${selectedNominal === n ? 'border-[#157a52] bg-[#157a52] text-white shadow-md scale-[1.02]' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-[#157a52]/50'}`}
                    >
                      Rp {n.toLocaleString('id-ID')}
                    </button>
                  ))}
                  <button onClick={() => { setSelectedNominal(null); setCustomNominal('0') }}
                    className={`p-3.5 border-2 rounded-[16px] text-[14px] font-bold transition-all ${!selectedNominal && customNominal ? 'border-[#157a52] bg-[#157a52] text-white' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-[#157a52]/50'}`}
                  >
                    Nominal Lainnya
                  </button>
                </div>
                {(!selectedNominal) && (
                  <div className="flex items-center border-2 border-[#157a52] rounded-[16px] px-5 h-[60px] bg-[#157a52]/5 mt-4">
                    <span className="text-[#157a52] font-bold text-[16px] mr-3">Rp</span>
                    <input
                      type="text" placeholder="Masukkan Nominal"
                      value={customNominal ? formatRupiah(customNominal) : ''}
                      onChange={e => setCustomNominal(e.target.value)}
                      className="flex-1 bg-transparent text-[16px] font-bold text-[#0c1421] placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* METODE PEMBAYARAN */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest">Metode Pembayaran</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full h-[56px] px-5 bg-white border-2 border-gray-100 rounded-[16px] focus:border-[#157a52] outline-none font-semibold text-[#0c1421] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Metode Pembayaran</option>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <button onClick={handleDonasi} className="w-full h-[60px] bg-[#157a52] text-white font-bold text-[16px] md:text-[18px] rounded-[16px] hover:bg-[#0c2e1c] active:scale-[0.98] transition-all shadow-lg tracking-wide">
                  Donasi Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-5 space-y-6">
            {/* Penggalang Dana */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h3 className="font-bold text-[#0c1421] text-[18px] mb-6">Penggalang Dana</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#e8f5ee] rounded-[16px] flex items-center justify-center p-3 shrink-0">
                  <img src={imgIconStar} alt="KajianQU" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-bold text-[#157a52] text-[18px]">KajianQU</p>
                  <div className="flex items-center gap-1.5 mt-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full w-fit">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Identitas Terverifikasi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donasi Lainnya */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h3 className="font-bold text-[#0c1421] text-[18px] mb-4 border-b border-gray-100 pb-4">Donasi Lainnya</h3>
              <div className="space-y-3">
                {[
                  { href: '/donasi/sodaqoh',       label: 'Sodaqoh',          desc: 'Sodaqoh yang akan dikelola' },
                  { href: '/donasi/wakaf-quran',   label: "Wakaf Al-Qur'an",  desc: "Wakaf akan di belikan Al-Qur'an" },
                  { href: '/donasi/katalog-produk', label: 'Katalog Produk',   desc: 'Produk dari hasil sodaqoh' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center justify-between p-4 rounded-[16px] hover:bg-emerald-50 border border-gray-100 hover:border-[#157a52]/20 transition-all group"
                  >
                    <div>
                      <p className="font-bold text-[#157a52] text-[15px] group-hover:underline">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#157a52]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KETERANGAN */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] max-w-5xl mx-auto mt-4">
          <h3 className="font-bold text-[#0c1421] text-[24px] md:text-[28px] text-center mb-8 border-b border-gray-100 pb-4">Keterangan</h3>
          <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed text-justify max-w-4xl mx-auto">
            <p>Tahukah Anda bahwa wakaf bukan sekadar amal biasa? Wakaf adalah investasi abadi yang pahalanya terus mengalir bahkan setelah kita tiada.</p>
            <p>Dengan berwakaf, kita bisa membangun masjid, sekolah, rumah sakit, atau sumur air bersih yang akan terus memberi manfaat bagi banyak orang. Setiap sujud yang dilakukan, setiap ilmu yang diajarkan, dan setiap tetes air yang diminum, menjadi amal jariyah bagi kita.</p>
            <p><strong>🌱 Sedekah yang Tak Terputus</strong><br />Berbeda dengan sedekah biasa, wakaf terus berlipat ganda manfaatnya. Wakaf yang kita berikan hari ini, akan terus menjadi sumber kebaikan hingga generasi mendatang.</p>
            <p><strong>🌟 Berapapun Nilainya, Pahalanya Tak Terbatas</strong><br />Jangan khawatir jika Anda merasa jumlah yang diberikan kecil. Dengan wakaf tunai, siapapun bisa berkontribusi sesuai kemampuan, dan manfaatnya tetap luar biasa!</p>
            <p><strong>🏆 Saatnya Beraksi!</strong><br />Jadilah bagian dari perubahan. Mari berwakaf dan jadikan harta kita sebagai ladang pahala yang tak terputus.</p>
          </div>
        </div>

        {/* PROGRAM BUATAN */}
        <div className="mt-12">
          <h3 className="font-bold text-[#0c1421] text-[22px] mb-6">Program Buatan kami</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <img src={imgEAbsensi} alt="E-Absensi" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h4 className="font-bold text-gray-800 text-lg">E-Absensi</h4>
                <p className="text-gray-500 text-sm mt-1">Sistem digital buat mencatat kehadiran secara otomatis (online).</p>
              </div>
            </div>
            <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <img src={imgCBT} alt="CBT" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h4 className="font-bold text-gray-800 text-lg">CBT (Computer Based Test)</h4>
                <p className="text-gray-500 text-sm mt-1">Sistem ujian berbasis komputer yang memungkinkan peserta mengerjakan soal secara digital.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
