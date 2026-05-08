'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { MateriService } from '@/lib/materi-service'

const TOPICS = ['Akhlak', 'Fiqih', 'Tafsir', 'B. Arrab', 'Hadits', 'Akidah']
const LEVELS: Record<string, string> = {
  mudah: 'bg-emerald-500', menengah: 'bg-orange-400', sulit: 'bg-red-500'
}

const DUMMY_MATERI = [
  { id:'1', slug:'hukum-tahlilan-1', title:'Hukumnya Tahlilan', keilmuan:{nama:'Fiqih'}, summary:'Fiqhul Wadhih', level:'mudah',    image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
  { id:'2', slug:'hukum-tahlilan-2', title:'Hukumnya Tahlilan', keilmuan:{nama:'Fiqih'}, summary:'Safinatun Najah', level:'menengah', image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
  { id:'3', slug:'hukum-tahlilan-3', title:'Hukumnya Tahlilan', keilmuan:{nama:'Tafsir'}, summary:'Tafsir Ibnu Katsir', level:'mudah', image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
  { id:'4', slug:'hukum-tahlilan-4', title:'Hukumnya Tahlilan', keilmuan:{nama:'B.Arab'}, summary:'Nahwu',  level:'sulit', image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
  { id:'5', slug:'hukum-tahlilan-5', title:'Hukumnya Tahlilan', keilmuan:{nama:'Akhlak'}, summary:'Akhak lil Banin', level:'mudah', image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
  { id:'6', slug:'hukum-tahlilan-6', title:'Hukumnya Tahlilan', keilmuan:{nama:'Akhlak'}, summary:"Ta'limul Muta'lim", level:'sulit', image:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500' },
]

export default function MateriClient() {
  const [search, setSearch]         = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setTopic]   = useState('')
  const [materi, setMateri]         = useState<any[]>(DUMMY_MATERI)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    MateriService.getAllMaterials()
      .then(data => { if (data?.length) setMateri(data) })
      .catch(() => {})
  }, [])

  const handleSearch = () => setSearchQuery(search)
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch() }

  const filtered = useMemo(() =>
    materi.filter(m => {
      const matchSearch = !searchQuery || m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || m.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTopic  = !selectedTopic || m.keilmuan?.nama === selectedTopic
      return matchSearch && matchTopic
    }), [materi, searchQuery, selectedTopic]
  )

  return (
    <div className="bg-white min-h-screen font-['Poppins',sans-serif]">

      {/* HERO */}
      <section className="bg-[#157a52] pt-28 pb-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <p className="text-[#d3ad0f] text-sm font-bold uppercase tracking-widest">Program Keilmuan</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">Tambah Ilmu dari KajianQu</h1>
          <p className="text-white/80 text-base leading-relaxed">
            Program Keilmuan adalah ruang untuk bertanya, berbagi, dan belajar Islam bersama secara nyaman dan saling menghargai.
          </p>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="max-w-[900px] mx-auto px-6 -mt-6 relative z-10 mb-10">
        <div className="bg-white rounded-[24px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-gray-100">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Masukan nama kitab..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[16px] text-sm font-medium focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-[#157a52] text-white font-bold rounded-[16px] hover:bg-[#0c2e1c] transition-all text-sm shadow-lg shadow-[#157a52]/20 active:scale-95"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR TOPIK */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm sticky top-28">
              <h3 className="font-bold text-[#0c1421] text-lg mb-4">Topik</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setTopic('')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left ${!selectedTopic ? 'bg-[#e8f5ee] text-[#157a52] font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className={`w-4 h-4 border-2 rounded flex-shrink-0 ${!selectedTopic ? 'border-[#157a52] bg-[#157a52]' : 'border-gray-300'}`} />
                  Semua
                </button>
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setTopic(t === selectedTopic ? '' : t)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left ${selectedTopic === t ? 'bg-[#e8f5ee] text-[#157a52] font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className={`w-4 h-4 border-2 rounded flex-shrink-0 ${selectedTopic === t ? 'border-[#157a52] bg-[#157a52]' : 'border-gray-300'}`} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MATERI GRID */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#157a52]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold text-lg">Materi tidak ditemukan</p>
                <p className="text-gray-300 text-sm mt-2">Coba kata kunci lain</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(m => (
                  <div key={m.id} className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                    <div className="relative h-48 overflow-hidden bg-gray-50">
                      <img src={m.image || 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=500'} alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {m.level && (
                        <span className={`absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize ${LEVELS[m.level] || 'bg-gray-500'}`}>
                          {m.level.charAt(0).toUpperCase() + m.level.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-[#157a52] transition-colors">{m.title}</h4>
                      <p className="text-xs text-gray-500 mb-1">{m.keilmuan?.nama}</p>
                      {m.summary && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                          <span>📖</span>
                          <span>{m.summary}</span>
                        </div>
                      )}
                      <Link href={`/keilmuan/${m.slug || m.id}`}
                        className="w-full block text-center py-2.5 border-2 border-[#157a52] text-[#157a52] rounded-xl text-sm font-bold hover:bg-[#157a52] hover:text-white transition-all"
                      >
                        Tonton Sekarang ›
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}