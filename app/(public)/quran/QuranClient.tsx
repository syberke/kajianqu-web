'use client'



import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { QURAN_SURAHS } from '@/lib/quran-data'

type Tab       = 'tahfidz' | 'tahsin'
type FilterMode = 'juz' | 'surah'

const SURAH_LIST = Object.values(QURAN_SURAHS).map(s => ({
  id:        s.id,
  name:      s.name,
  arabic:    s.nameArabic,
  type:      (s as any).type || 'Makkiyah',
  totalAyat: s.totalAyat,
}))
const ALL_SURAHS = Array.from({ length: 114 }, (_, i) => {
  const existing = QURAN_SURAHS[i + 1]
  if (existing) {
    return {
      id:        existing.id,
      name:      existing.name,
      arabic:    existing.nameArabic,
      type:      'Makkiyah',
      totalAyat: existing.totalAyat,
    }
  }
  // Surat lainnya — nanti ambil dari API
  const names: Record<number, [string, string, number, string]> = {
    2:   ['Al-Baqarah',   'البقرة',   286, 'Madaniyah'],
    3:   ['Ali Imran',    'آل عمران', 200, 'Madaniyah'],
    4:   ['An-Nisa',      'النساء',   176, 'Madaniyah'],
    5:   ['Al-Maidah',    'المائدة',  120, 'Madaniyah'],
    36:  ['Yasin',        'يس',       83,  'Makkiyah'],
    67:  ['Al-Mulk',      'الملك',    30,  'Makkiyah'],
    78:  ['An-Naba',      'النبأ',    40,  'Makkiyah'],
    112: ['Al-Ikhlas',    'الإخلاص',  4,   'Makkiyah'],
    113: ['Al-Falaq',     'الفلق',    5,   'Makkiyah'],
    114: ['An-Nas',       'الناس',    6,   'Makkiyah'],
  }
  const meta = names[i + 1]
  return {
    id:        i + 1,
    name:      meta ? meta[0] : `Surah ${i + 1}`,
    arabic:    meta ? meta[1] : '',
    type:      meta ? meta[3] : 'Makkiyah',
    totalAyat: meta ? meta[2] : 7,
  }
})

export default function QuranClient() {
  const router = useRouter()
  const [activeTab,   setActiveTab]   = useState<Tab>('tahfidz')
  const [filterMode,  setFilterMode]  = useState<FilterMode>('surah')
  const [searchSurah, setSearchSurah] = useState('')
  const [ayahStart,   setAyahStart]   = useState('')
  const [ayahEnd,     setAyahEnd]     = useState('')

  // Filter berdasarkan pencarian nama surat
  const filteredSurahs = useMemo(() => {
    if (!searchSurah.trim()) return ALL_SURAHS
    return ALL_SURAHS.filter(s =>
      s.name.toLowerCase().includes(searchSurah.toLowerCase())
    )
  }, [searchSurah])

  const handleSurahClick = (surah: typeof ALL_SURAHS[0]) => {
    const start = ayahStart || '1'
    const end   = ayahEnd   || String(surah.totalAyat)
    router.push(`/quran/${activeTab}/${surah.id}?start=${start}&end=${end}`)
  }

  return (
    <div className="min-h-screen bg-white pt-[72px] font-['Poppins',sans-serif]">

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-b from-[#1a7a53] to-[#0d5c3a] pt-16 pb-28 px-6 text-center overflow-hidden">
        {/* Dekorasi bulan sabit kiri */}
        <div className="absolute left-12 top-8 opacity-20">
          <div className="w-32 h-40 border-[6px] border-white rounded-full" style={{ clipPath: 'ellipse(40% 50% at 30% 50%)' }} />
        </div>
        {/* Dekorasi kanan */}
        <div className="absolute right-8 bottom-0 opacity-10 text-white text-[200px] font-arabic leading-none select-none">
          ب
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <p className="text-white/70 text-sm font-semibold tracking-widest uppercase">Sahabat Qur'an</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Ngaji Bareng Sahabat Qur'an
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Sahabat Quran adalah ruang untuk bertanya, berbagi, dan belajar<br/>
            Islam bersama secara nyaman dan saling menghargai.
          </p>
        </div>
      </div>

      {/* ── TAB: Tahfidz | Tahsin — overlap hero ── */}
      <div className="max-w-[860px] mx-auto px-6 -mt-9 relative z-10 mb-10">
        <div className="flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setActiveTab('tahfidz')}
            className={`flex-1 py-4 text-base font-bold transition-all ${
              activeTab === 'tahfidz'
                ? 'bg-[#1a7a53] text-white'
                : 'text-[#1a7a53] hover:bg-emerald-50'
            }`}
          >
            Tahfidz
          </button>
          <button
            onClick={() => setActiveTab('tahsin')}
            className={`flex-1 py-4 text-base font-bold transition-all ${
              activeTab === 'tahsin'
                ? 'bg-[#1a7a53] text-white'
                : 'text-[#1a7a53] hover:bg-emerald-50'
            }`}
          >
            Tahsin
          </button>
        </div>
      </div>

      {/* ── FILTER + DAFTAR SURAT ── */}
      <div className="max-w-[860px] mx-auto px-6 pb-20 space-y-6">

        {/* Filter card */}
        <div className="border border-gray-200 rounded-2xl p-5 space-y-5 bg-white">

          {/* Pilih PerJuz / Pilih Persurat */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pilih PerJuz */}
            <button
              onClick={() => setFilterMode('juz')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                filterMode === 'juz'
                  ? 'border-[#1a7a53] bg-emerald-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                filterMode === 'juz' ? 'border-[#1a7a53] bg-[#1a7a53]' : 'border-gray-300'
              }`}>
                {filterMode === 'juz' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold ${filterMode === 'juz' ? 'text-[#1a7a53]' : 'text-gray-500'}`}>
                Pilih PerJuz
              </span>
            </button>

            {/* Pilih Persurat */}
            <button
              onClick={() => setFilterMode('surah')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                filterMode === 'surah'
                  ? 'border-[#1a7a53] bg-emerald-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                filterMode === 'surah' ? 'border-[#1a7a53] bg-[#1a7a53]' : 'border-gray-300'
              }`}>
                {filterMode === 'surah' && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold ${filterMode === 'surah' ? 'text-[#1a7a53]' : 'text-gray-500'}`}>
                Pilih Persurat
              </span>
            </button>
          </div>

          {/* Input filter */}
          {filterMode === 'surah' ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600">Nama Surat</label>
                <input
                  type="text"
                  placeholder="Masukkan nama surah"
                  value={searchSurah}
                  onChange={e => setSearchSurah(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600">Nomor Awal Ayat</label>
                <input
                  type="number" min="1"
                  placeholder="Masukkan nomor ayat"
                  value={ayahStart}
                  onChange={e => setAyahStart(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600">Nomor Akhir Ayat</label>
                <input
                  type="number" min="1"
                  placeholder="Masukkan nomor ayat"
                  value={ayahEnd}
                  onChange={e => setAyahEnd(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600">Juz Awal</label>
                <input type="number" min="1" max="30" placeholder="1"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600">Juz Akhir</label>
                <input type="number" min="1" max="30" placeholder="30"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── GRID SURAT ── */}
        <div className="grid grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.id}
              onClick={() => handleSurahClick(surah)}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-[#1a7a53] hover:shadow-md hover:bg-emerald-50/30 transition-all group text-left"
            >
              <div>
                <p className="font-bold text-gray-900 text-sm group-hover:text-[#1a7a53] transition-colors">
                  {surah.name}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{surah.type}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-800 leading-none">{surah.totalAyat}</p>
                <p className="text-gray-400 text-xs">Ayat</p>
              </div>
            </button>
          ))}
        </div>

        {filteredSurahs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">Surat tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}