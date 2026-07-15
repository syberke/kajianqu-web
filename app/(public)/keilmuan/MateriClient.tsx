'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

const TOPICS = ['Akhlak', 'Fiqih', 'Tafsir', 'B. Arrab', 'Hadits', 'Akidah']
const LEVELS: Record<string, string> = {
  mudah: 'bg-emerald-500',
  menengah: 'bg-orange-400',
  sulit: 'bg-red-500',
}

interface Keilmuan {
  id?: string
  nama: string
}

interface MateriItem {
  id: string
  slug: string
  title: string
  keilmuan: Keilmuan | null
  summary?: string | null
  description?: string | null
  youtube_url?: string | null
  thumbnail_url?: string | null
  asatidz?: { nama: string | null; foto_url?: string | null } | null
  type?: string | null
  level: 'mudah' | 'menengah' | 'sulit' | string | null
  image?: string
}

interface MateriClientProps {
  initialMaterials: MateriItem[]
  keilmuanList: Keilmuan[]
}

export default function MateriClient({ initialMaterials, keilmuanList }: MateriClientProps) {
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setTopic] = useState('')

  const handleSearch = () => setSearchQuery(search)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch()
  }

  const filtered = useMemo(
    () =>
      initialMaterials.filter((item) => {
        const keyword = searchQuery.toLowerCase()
        const matchSearch =
          !searchQuery ||
          item.title.toLowerCase().includes(keyword) ||
          item.summary?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        const matchTopic = !selectedTopic || item.keilmuan?.nama === selectedTopic
        return matchSearch && matchTopic
      }),
    [initialMaterials, searchQuery, selectedTopic],
  )

  const topics = keilmuanList.length > 0 ? keilmuanList.map((item) => item.nama) : TOPICS

  return (
    <div className="bg-white min-h-screen font-['Poppins',sans-serif]">
      <section className="bg-[#157a52] pt-28 pb-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <p className="text-[#d3ad0f] text-sm font-bold uppercase tracking-widest">Program Keilmuan</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">Tambah Ilmu dari KajianQu</h1>
          <p className="text-white/80 text-base leading-relaxed">
            Program Keilmuan adalah ruang untuk bertanya, berbagi, dan belajar Islam bersama secara nyaman dan saling menghargai.
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-6 -mt-6 relative z-10 mb-10">
        <div className="bg-white rounded-[24px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-gray-100">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Masukan nama kitab..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-12 pl-12 pr-4 bg-[#f7fbff] rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#157a52]"
              />
            </div>
            <button type="button" onClick={handleSearch} className="px-8 bg-[#157a52] text-white rounded-xl font-semibold hover:bg-[#10633f] transition-colors">
              Cari
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="flex flex-wrap gap-2 mb-8">
          <button type="button" onClick={() => setTopic('')} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${!selectedTopic ? 'bg-[#157a52] text-white' : 'bg-gray-100 text-gray-500 hover:bg-emerald-50'}`}>
            Semua
          </button>
          {topics.map((topic) => (
            <button key={topic} type="button" onClick={() => setTopic(topic)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedTopic === topic ? 'bg-[#157a52] text-white' : 'bg-gray-100 text-gray-500 hover:bg-emerald-50'}`}>
              {topic}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">Materi tidak ditemukan.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link key={item.id} href={`/keilmuan/${item.id}`} className="group rounded-[24px] border border-gray-100 overflow-hidden bg-white hover:shadow-xl transition-all">
                <div className="h-44 bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden">
                  {item.thumbnail_url || item.image ? (
                    <img src={item.thumbnail_url || item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full grid place-items-center text-5xl">📖</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-[#157a52]">{item.keilmuan?.nama || 'Kajian Umum'}</span>
                    {item.level && <span className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className={`w-2 h-2 rounded-full ${LEVELS[item.level] || 'bg-gray-300'}`} />{item.level}</span>}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#157a52] transition-colors">{item.title}</h2>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">{item.summary || item.description || 'Ringkasan materi belum tersedia.'}</p>
                  <p className="mt-4 text-xs text-gray-400">{item.asatidz?.nama || 'Asatidz KajianQu'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
