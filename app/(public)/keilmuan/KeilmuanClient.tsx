'use client'

// app/(public)/materi/MateriClient.tsx
// Sesuai screenshot 1:
// - Hero hijau: "Program Keilmuan", "Tambah Ilmu dari KajianQu"
// - Search bar + tombol Cari
// - Sidebar kiri: filter Topik (checkbox)
// - Grid 3 kolom card: thumbnail, badge level, judul, kategori, kitab, tombol "Tonton Sekarang"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, BookOpen } from 'lucide-react'

const imgFallback = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"

// ── Badge level ──────────────────────────────────────────────────────
const LEVEL_STYLE: Record<string, string> = {
  Mudah:     'bg-[#1a7a53] text-white',
  Menengah:  'bg-[#d3ad0f] text-white',
  Sulit:     'bg-red-500 text-white',
}

function getYouTubeThumb(url: string): string {
  if (!url) return imgFallback
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : imgFallback
}

// ── Card ─────────────────────────────────────────────────────────────
function MateriCard({ item }: { item: any }) {
  const thumb    = getYouTubeThumb(item.youtube_url || '')
  const level    = item.level || 'Mudah'
  const kategori = item.keilmuan?.nama || '-'
  const kitab    = item.summary || '-'

  return (
    <Link href={`/materi/${item.id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Thumbnail + badge level */}
        <div className="relative h-[180px] overflow-hidden">
          <img
            src={thumb} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = imgFallback }}
          />
          {/* Badge level di kanan atas */}
          <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_STYLE[level] || LEVEL_STYLE.Mudah}`}>
            {level}
          </span>
        </div>

        {/* Konten card */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#1a7a53] transition-colors">
            {item.title}
          </h3>

          {/* Kategori */}
          <p className="text-gray-500 text-sm">{kategori}</p>

          {/* Kitab — dengan icon buku */}
          <div className="flex items-center gap-1.5 text-[#1a7a53] text-sm">
            <BookOpen size={13} />
            <span className="line-clamp-1">{kitab}</span>
          </div>

          {/* Tombol */}
          <button className="w-full mt-2 bg-[#1a7a53]/10 hover:bg-[#1a7a53] text-[#1a7a53] hover:text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            Tonton Sekarang <span className="text-base">›</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

// ════════════════════════════════════════════════════════════════════
interface Props {
  initialMaterials: any[]
  keilmuanList:     { id: string; nama: string }[]
}

export default function MateriClient({ initialMaterials, keilmuanList }: Props) {
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCat, setSelectedCat] = useState<string[]>([])

  // Filter lokal (search + kategori)
  const filtered = useMemo(() => {
    return initialMaterials.filter(item => {
      const matchSearch = !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.summary?.toLowerCase().includes(search.toLowerCase())

      const matchCat = selectedCat.length === 0 ||
        selectedCat.includes(item.keilmuan_id)

      return matchSearch && matchCat
    })
  }, [initialMaterials, search, selectedCat])

  const toggleCat = (id: string) => {
    setSelectedCat(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleCari = () => setSearch(searchInput)

  return (
    // pt-[72px] karena navbar fixed
    <div className="min-h-screen bg-white pt-[72px]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a7a53] to-[#0d5c3a] pt-16 pb-24 px-6 text-center overflow-hidden">
        {/* Dekorasi buku */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-10">
          <div className="w-64 h-32 border-4 border-white rounded-t-full" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <p className="text-white/70 text-sm font-semibold tracking-widest uppercase">Program Keilmuan</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Tambah Ilmu dari KajianQu
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-lg mx-auto">
            Program Keilmuan adalah ruang untuk bertanya, berbagi, dan belajar Islam bersama secara nyaman dan saling menghargai.
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR — overlap hero ── */}
      <div className="max-w-[900px] mx-auto px-6 -mt-7 mb-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-3">
          <input
            type="text"
            placeholder="Masukan nama kitab..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCari()}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
          />
          <button
            onClick={handleCari}
            className="bg-[#1a7a53] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#15613f] active:scale-95 transition-all whitespace-nowrap"
          >
            Cari
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT: sidebar + grid ── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="flex gap-8 items-start">

          {/* ── SIDEBAR TOPIK ── */}
          <aside className="w-[200px] shrink-0 sticky top-[90px]">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <p className="font-bold text-gray-800 text-base mb-4">Topik</p>
              <div className="space-y-3">
                {keilmuanList.length === 0 ? (
                  // Dummy topik kalau DB kosong
                  ['Akhlak', 'Fiqih', 'Tafsir', 'B. Arrab'].map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded group-hover:border-[#1a7a53] transition-colors flex-shrink-0" />
                      <span className="text-gray-600 text-sm group-hover:text-[#1a7a53] transition-colors">{t}</span>
                    </label>
                  ))
                ) : (
                  keilmuanList.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleCat(cat.id)}
                        className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                          selectedCat.includes(cat.id)
                            ? 'border-[#1a7a53] bg-[#1a7a53]'
                            : 'border-gray-300 group-hover:border-[#1a7a53]'
                        }`}
                      >
                        {selectedCat.includes(cat.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span
                        onClick={() => toggleCat(cat.id)}
                        className={`text-sm cursor-pointer transition-colors ${
                          selectedCat.includes(cat.id) ? 'text-[#1a7a53] font-semibold' : 'text-gray-600 group-hover:text-[#1a7a53]'
                        }`}
                      >
                        {cat.nama}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {/* Reset filter */}
              {selectedCat.length > 0 && (
                <button
                  onClick={() => setSelectedCat([])}
                  className="mt-4 w-full text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Hapus filter
                </button>
              )}
            </div>
          </aside>

          {/* ── GRID MATERI ── */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              // Empty state — tampilkan dummy sesuai screenshot
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {DUMMY_MATERIALS.map((item, i) => (
                  <MateriCard key={i} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                  <MateriCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Info jumlah hasil */}
            {search && filtered.length > 0 && (
              <p className="text-center text-gray-400 text-sm mt-8">
                Menampilkan {filtered.length} hasil untuk "<strong>{search}</strong>"
              </p>
            )}

            {search && filtered.length === 0 && initialMaterials.length > 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="text-4xl">🔍</p>
                <p className="text-gray-500 font-semibold">Tidak ada materi ditemukan</p>
                <p className="text-gray-400 text-sm">Coba kata kunci lain</p>
                <button onClick={() => { setSearch(''); setSearchInput('') }}
                  className="text-[#1a7a53] font-semibold text-sm hover:underline"
                >
                  Hapus pencarian
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dummy data kalau DB masih kosong ─────────────────────────────────
const DUMMY_MATERIALS = [
  { id: 'dummy-1', title: 'Hukumnya Tahlilan', level: 'Mudah',    keilmuan: { nama: 'Fiqih'  }, summary: 'Fiqhul Wadhih',    youtube_url: '' },
  { id: 'dummy-2', title: 'Hukumnya Tahlilan', level: 'Menengah', keilmuan: { nama: 'Fiqih'  }, summary: 'Safinatun Najah', youtube_url: '' },
  { id: 'dummy-3', title: 'Hukumnya Tahlilan', level: 'Mudah',    keilmuan: { nama: 'Tafsir' }, summary: 'Tafsir Ibnu Katsir', youtube_url: '' },
  { id: 'dummy-4', title: 'Hukumnya Tahlilan', level: 'Sulit',    keilmuan: { nama: 'B.Arab' }, summary: 'Nahwu',            youtube_url: '' },
  { id: 'dummy-5', title: 'Hukumnya Tahlilan', level: 'Mudah',    keilmuan: { nama: 'Akhlak' }, summary: 'Akhak lil Banin',  youtube_url: '' },
  { id: 'dummy-6', title: 'Hukumnya Tahlilan', level: 'Sulit',    keilmuan: { nama: 'Akhlak' }, summary: "Ta'limul Muta'im", youtube_url: '' },
]