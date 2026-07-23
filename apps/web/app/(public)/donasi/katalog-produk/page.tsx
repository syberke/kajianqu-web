'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'

const imgBg = "https://images.unsplash.com/photo-1584281723358-466f28688439?auto=format&fit=crop&q=80&w=1400"
const imgEAbsensi = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
const imgCBT = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"

const ALL_PRODUCTS = [
  { id:1, name:'Sajadah Kain Batik', price:7000, badge:'Baru', image:'https://images.unsplash.com/photo-1606761036441-283807210b42?q=80&w=400' },
  { id:2, name:'Sajadah Kain Batik', price:7000, badge:'Baru', image:'https://images.unsplash.com/photo-1606761036441-283807210b42?q=80&w=400' },
  { id:3, name:'Sajadah Kain Batik', price:7000, badge:'Baru', image:'https://images.unsplash.com/photo-1606761036441-283807210b42?q=80&w=400' },
  { id:4, name:'Sajadah Kain Batik', price:7000, badge:'Baru', image:'https://images.unsplash.com/photo-1606761036441-283807210b42?q=80&w=400' },
  { id:5, name:'Tasbih Kayu', price:15000, badge:'Baru', image:'https://images.unsplash.com/photo-1617799847163-e4c92c1c0fae?q=80&w=400' },
  { id:6, name:'Tasbih Kayu', price:15000, badge:'Baru', image:'https://images.unsplash.com/photo-1617799847163-e4c92c1c0fae?q=80&w=400' },
  { id:7, name:'Tasbih Kayu', price:15000, badge:'Baru', image:'https://images.unsplash.com/photo-1617799847163-e4c92c1c0fae?q=80&w=400' },
  { id:8, name:'Tasbih Kayu', price:15000, badge:'Baru', image:'https://images.unsplash.com/photo-1617799847163-e4c92c1c0fae?q=80&w=400' },
]

export default function KatalogProdukPage() {
  const [search, setSearch]       = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => setSearchQuery(search)
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch() }

  const filtered = useMemo(() =>
    ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  )

  return (
    <div className="bg-[#f8fffe] min-h-screen font-['Poppins',sans-serif]">

      {/* HERO */}
      <section className="relative text-white pt-32 pb-24 px-6 overflow-hidden flex items-center justify-center min-h-[350px]">
        <div className="absolute inset-0 z-0">
          <img src={imgBg} alt="Katalog Produk" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0d5c3a]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d5c3a]/95 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10 mt-6">
          <p className="text-[#d3ad0f] text-sm font-bold uppercase tracking-widest">Program Donasi</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">Katalog Produk</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-[14px] md:text-[16px] leading-relaxed">
            Belanja produk pilihan sekaligus ikut menguatkan program kebaikan KajianQu.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20 mt-[-30px] relative z-20">

        {/* SEARCH BAR */}
        <div className="bg-white rounded-[24px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Masukan nama Produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-[16px] text-sm font-medium focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-[#157a52] text-white font-bold rounded-[16px] hover:bg-[#0c2e1c] transition-all text-sm shadow-lg shadow-[#157a52]/20 active:scale-95 whitespace-nowrap"
            >
              Cari
            </button>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold text-lg">Produk tidak ditemukan</p>
            <p className="text-gray-300 text-sm mt-2">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {p.badge && (
                    <span className="absolute top-3 left-3 bg-[#157a52] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h5 className="font-bold text-gray-800 text-sm mb-1">{p.name}</h5>
                  <p className="text-[#157a52] font-bold text-sm mb-3">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="text-xs font-bold text-[#157a52] flex items-center gap-1 hover:gap-2 transition-all group/btn">
                    Hubungi Kami <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KETERANGAN */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] max-w-5xl mx-auto mb-12">
          <h3 className="font-bold text-[#0c1421] text-[24px] text-center mb-8 border-b border-gray-100 pb-4">Keterangan</h3>
          <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed text-justify max-w-4xl mx-auto">
            <p>Tahukah Anda bahwa wakaf bukan sekadar amal biasa? Wakaf adalah investasi abadi yang pahalanya terus mengalir bahkan setelah kita tiada.</p>
            <p>Dengan berwakaf, kita bisa membangun masjid, sekolah, rumah sakit, atau sumur air bersih yang akan terus memberi manfaat bagi banyak orang.</p>
            <p><strong>🌱 Sedekah yang Tak Terputus</strong><br />Berbeda dengan sedekah biasa, wakaf terus berlipat ganda manfaatnya. Wakaf yang kita berikan hari ini, akan terus menjadi sumber kebaikan hingga generasi mendatang.</p>
            <p><strong>🌟 Berapapun Nilainya, Pahalanya Tak Terbatas</strong><br />Jangan khawatir jika Anda merasa jumlah yang diberikan kecil. Dengan wakaf tunai, siapapun bisa berkontribusi sesuai kemampuan, dan manfaatnya tetap luar biasa!</p>
            <p><strong>🏆 Saatnya Beraksi!</strong><br />Jadilah bagian dari perubahan. Mari berwakaf dan jadikan harta kita sebagai ladang pahala yang tak terputus.</p>
          </div>
        </div>

        {/* PROGRAM BUATAN */}
        <div>
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
