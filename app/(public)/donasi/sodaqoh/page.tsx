"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Copy, CheckCircle2 } from "lucide-react"

// Jika kamu butuh data dari file lokalmu, pastikan import ini di-uncomment:
// import { categories } from "../data/donasi"

export default function FormDonasiSodaqoh({ slug }: { slug: string }) {
  // Dummy fallback untuk judul khusus Sodaqoh Jariyah
  const fallbackData = { 
    title: "Sodaqoh Jariyah", 
    description: "Bantu pembangunan pondok pesantren dan fasilitas belajar untuk generasi Rabbani." 
  }
  // const data = categories?.find((c) => c.slug === slug) || fallbackData
  const data = fallbackData; // Gunakan ini sementara untuk test UI

  const nominals = [10000, 25000, 50000, 100000, 150000]
  
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null)
  const [customNominal, setCustomNominal] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("08121323111")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format angka ke Rupiah
  const formatRupiah = (angka: string | number) => {
    const str = angka.toString().replace(/\D/g, "")
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  return (
    <div className="bg-[#f8fffe] min-h-screen font-['Poppins',sans-serif]">

      {/* ================= HERO SECTION (BACKGROUND GAMBAR SODAqOH) ================= */}
      <section className="relative text-white pt-32 pb-24 px-6 overflow-hidden flex items-center justify-center min-h-[350px]">
        {/* Gambar Background Utama */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Screenshot 2026-03-27 160415.jpg" 
            alt="Hero Background Sodaqoh" 
            className="w-full h-full object-cover"
          />
          {/* Overlay Hijau Transparan */}
          <div className="absolute inset-0 bg-[#0d5c3a]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d5c3a]/95 to-transparent" />
        </div>

        {/* Konten Text di Atas Gambar */}
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10 mt-6">
          <div className="inline-flex items-center gap-2 border border-[#d3ad0f] text-[#d3ad0f] font-bold px-5 py-2 rounded-full text-[13px] md:text-sm bg-[#0c2e1c]/40 backdrop-blur-sm mb-2 shadow-lg">
            Program Donasi KajianQu
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">
            {data.title}
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-[14px] md:text-[16px] leading-relaxed drop-shadow-sm">
            {data.description}
          </p>
        </div>
      </section>

      {/* ================= CONTENT MAIN ================= */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20 mt-[-50px] relative z-20">
        
        {/* ── GRID ATAS: FORM KIRI & SIDEBAR KANAN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-8 md:mb-10">

          {/* ================= KIRI: FORM DONASI ================= */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h2 className="text-[22px] md:text-[26px] font-bold text-[#0c1421] mb-6">Lengkapi Donasi</h2>

              {/* NO REKENING */}
              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">No. Rekening Transfer</label>
                <div className="flex items-center justify-between p-4 md:p-5 bg-[#e8f5ee] border border-[#157a52]/20 rounded-[20px]">
                  <div className="flex flex-col">
                    <span className="text-[12px] md:text-[13px] text-[#157a52] font-semibold mb-1">Bank Syariah Indonesia (BSI)</span>
                    <span className="text-[#0c1421] font-bold text-[22px] md:text-[24px] tracking-wider leading-none">
                      08121323111
                    </span>
                  </div>
                  {/* Tombol Salin disesuaikan dengan gambar referensi */}
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#157a52] rounded-[10px] border border-gray-200 hover:bg-[#157a52] hover:text-white transition-all shadow-sm font-bold text-[13px]"
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    <span className="hidden sm:inline">{copied ? "Berhasil" : "Salin"}</span>
                  </button>
                </div>
              </div>

              {/* NOMINAL */}
              <div className="mb-8">
                <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3">Pilih Nominal Infaq</label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {nominals.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setSelectedNominal(n)
                        setCustomNominal("")
                      }}
                      className={`p-3.5 border-2 rounded-[16px] text-[14px] font-bold transition-all ${
                        selectedNominal === n
                        ? "border-[#157a52] bg-[#157a52] text-white shadow-md scale-[1.02]"
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-[#157a52]/50 hover:bg-white"
                      }`}
                    >
                      Rp {n.toLocaleString("id-ID")}
                    </button>
                  ))}

                  <button 
                    onClick={() => {
                      setSelectedNominal(null)
                      document.getElementById("input-nominal-custom")?.focus()
                    }}
                    className={`p-3.5 border-2 rounded-[16px] text-[14px] font-bold transition-all ${
                      !selectedNominal && customNominal !== ""
                      ? "border-[#157a52] bg-[#157a52] text-white shadow-md scale-[1.02]"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-[#157a52]/50 hover:bg-white"
                    }`}
                  >
                    Nominal Lainnya
                  </button>
                </div>

                {/* INPUT CUSTOM NOMINAL */}
                <div className={`overflow-hidden transition-all duration-300 ${(!selectedNominal && customNominal !== "") || (!selectedNominal && customNominal === "") ? 'h-[60px] opacity-100 mt-4' : 'h-0 opacity-0 m-0'}`}>
                  <div className="flex items-center border-2 border-[#157a52] rounded-[16px] px-5 h-full bg-[#157a52]/5 focus-within:ring-4 focus-within:ring-[#157a52]/10 transition-all">
                    <span className="text-[#157a52] font-bold text-[16px] mr-3">Rp</span>
                    <input
                      id="input-nominal-custom"
                      type="text"
                      placeholder="Masukkan jumlah donasi..."
                      value={customNominal ? formatRupiah(customNominal) : ""}
                      onChange={(e) => {
                        setCustomNominal(e.target.value)
                        setSelectedNominal(null)
                      }}
                      className="flex-1 bg-transparent text-[16px] font-bold text-[#0c1421] placeholder:text-gray-400 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* METODE PEMBAYARAN & SUBMIT */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-gray-500 uppercase tracking-widest">Metode Pembayaran</label>
                  <div className="relative">
                    <select className="w-full h-[56px] px-5 bg-white border-2 border-gray-100 rounded-[16px] focus:border-[#157a52] focus:ring-4 focus:ring-[#157a52]/10 outline-none font-semibold text-[#0c1421] appearance-none cursor-pointer transition-all">
                      <option value="" disabled selected>Pilih Metode Pembayaran</option>
                      <option>Transfer Bank (Konfirmasi Otomatis)</option>
                      <option>E-Wallet (OVO / Dana / GoPay)</option>
                      <option>QRIS</option>
                    </select>
                    {/* Icon Dropdown */}
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <button className="w-full h-[60px] bg-[#157a52] text-white font-bold text-[16px] md:text-[18px] rounded-[16px] hover:bg-[#0c2e1c] active:scale-[0.98] transition-all shadow-lg shadow-[#157a52]/30 tracking-wide">
                  Donasi Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* ================= KANAN: SIDEBAR ================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* PENGGALANG */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8f5ee] rounded-full -mr-16 -mt-16 opacity-60"></div>
              
              <h3 className="font-bold text-[#0c1421] text-[18px] mb-6 relative z-10">Penggalang Dana</h3>

              <div className="flex items-center gap-4 relative z-10">
                {/* Ikon Sodaqoh dengan background hijau pupus seperti referensi */}
                <div className="w-16 h-16 bg-[#e8f5ee] border border-[#157a52]/20 flex items-center justify-center rounded-[16px] p-3 shrink-0">
                   <img src="/Screenshot 2026-03-27 160438.png" alt="Icon Sodaqoh" className="w-full h-full object-contain" />
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

            {/* DONASI LAIN (Menampilkan Wakaf, Infaq, Katalog) */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <h3 className="font-bold text-[#0c1421] text-[18px] mb-4 border-b border-gray-100 pb-4">Donasi Lainnya</h3>

              <div className="space-y-4">
                {[
                  { 
                    id: 'wakaf', 
                    title: "Wakaf Al-Qur'an", 
                    desc: "Bantu sediakan Al-Qur'an yang layak untuk pelosok.", 
                    img: "/Screenshot 2026-03-27 160234.jpg" 
                  },
                  { 
                    id: 'infaq', 
                    title: "Infaq Asatidz", 
                    desc: "Bisyaroh untuk asatidz pengajar Al-Qur'an.", 
                    img: "/Rectangle 23831 (1).png" 
                  },
                  { 
                    id: 'katalog', 
                    title: "Katalog Produk", 
                    desc: "Beli produk sambil berdonasi untuk umat.", 
                    img: "/Screenshot 2026-03-27 160857.jpg" 
                  }
                ].map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/donasi/${cat.id}`}
                    className="group flex gap-4 p-3 border border-gray-100 rounded-[20px] hover:border-[#157a52]/30 hover:shadow-md transition-all bg-gray-50/50 hover:bg-white"
                  >
                    <div className="w-20 h-20 rounded-[14px] overflow-hidden shrink-0">
                      <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-[#0c1421] text-[14px] group-hover:text-[#157a52] transition-colors line-clamp-1">{cat.title}</h4>
                      <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{cat.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
          </div>
        </div>

        {/* ── BAWAH: BOARD KETERANGAN PROGRAM (FULL WIDTH) ── */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] max-w-5xl mx-auto mt-4">
          <h3 className="font-bold text-[#0c1421] text-[24px] md:text-[28px] text-center mb-8 border-b border-gray-100 pb-4">
            Keterangan Program
          </h3>
          
          <div className="space-y-6 text-[15px] md:text-[16px] text-gray-600 leading-relaxed text-justify max-w-4xl mx-auto">
            <p>
              <strong>Assalamu'alaikum #OrangBaik,</strong>
            </p>
            <p>
              Setiap langkah para penuntut ilmu (santri) yang berjalan menuju majelis ilmu, setiap huruf yang mereka hafal, dan setiap sujud yang mereka lakukan di pesantren, menyimpan jutaan berkah dan pahala. Namun sayangnya, masih banyak pondok pesantren dan madrasah yang kondisinya memprihatinkan dan kekurangan fasilitas belajar yang memadai.
            </p>
            
            {/* Highlight Box Keutamaan Sodaqoh Jariyah */}
            <div className="bg-[#e8f5ee] p-6 md:p-8 rounded-[24px] border border-[#157a52]/20 my-8">
              <p className="font-bold text-[#157a52] text-[18px] mb-4">Keutamaan Sodaqoh Jariyah:</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-[#157a52] shrink-0 mt-0.5" />
                  <span><strong>Amal yang Tidak Terputus:</strong> Sebagaimana hadits Rasulullah ﷺ, sedekah jariyah adalah salah satu dari tiga amalan yang pahalanya akan terus mengalir meskipun kita sudah meninggal dunia.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-[#157a52] shrink-0 mt-0.5" />
                  <span><strong>Membangun Peradaban:</strong> Dengan fasilitas yang baik, para santri dapat belajar lebih fokus untuk menjadi generasi penerus yang berakhlak mulia.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-[#157a52] shrink-0 mt-0.5" />
                  <span><strong>Membersihkan Harta:</strong> Sedekah akan mensucikan harta benda kita dan menjadikannya jauh lebih berkah di mata Allah Ta'ala.</span>
                </li>
              </ul>
            </div>

            <p>
              Mari bersama-sama kita bangun fasilitas belajar yang nyaman, madrasah yang kokoh, serta asrama yang layak bagi para generasi Qur'ani. Donasi yang kamu berikan hari ini, insyaAllah akan menjadi saksi kebaikanmu di akhirat kelak.
            </p>
            <p className="font-bold text-[#0c1421] pt-4 text-center">
              Jazakumullahu Khairan Katsiran.<br/>
              Semoga Allah membalas kebaikanmu dengan keberkahan yang berlipat ganda.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}