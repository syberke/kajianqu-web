'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { QuranService } from '@/lib/quran-service'

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  nama?:     string
  email?:    string
  foto_url?: string
  role?:     string
}

interface Props {
  userProfile: UserProfile | null
}

interface SurahItem {
  id:   number
  name: string
  type: string
  ayat: number
}

interface JuzItem {
  juz:        number
  surahCount: number
}

// Interface untuk mencocokkan payload dari API alquran.cloud
interface ApiSurahItem {
  number: string | number
  englishName: string
  revelationType: string
  numberOfAyahs: string | number
}

// ── 114 Surah fallback (dipakai saat API belum selesai) ───────────────────────
const SURAH_FALLBACK: SurahItem[] = [
  { id:1,   name:'Al-Fatihah',    type:'Makkiyah',  ayat:7   },
  { id:2,   name:'Al-Baqarah',    type:'Madaniyah', ayat:286 },
  { id:3,   name:'Ali Imran',     type:'Madaniyah', ayat:200 },
  { id:4,   name:'An-Nisa',       type:'Madaniyah', ayat:176 },
  { id:5,   name:'Al-Maidah',     type:'Madaniyah', ayat:120 },
  { id:6,   name:'Al-Anam',       type:'Makkiyah',  ayat:165 },
  { id:7,   name:'Al-Araf',       type:'Makkiyah',  ayat:206 },
  { id:8,   name:'Al-Anfal',      type:'Madaniyah', ayat:75  },
  { id:9,   name:'At-Tawbah',     type:'Madaniyah', ayat:129 },
  { id:10,  name:'Yunus',         type:'Makkiyah',  ayat:109 },
  { id:11,  name:'Hud',           type:'Makkiyah',  ayat:123 },
  { id:12,  name:'Yusuf',         type:'Makkiyah',  ayat:111 },
  { id:13,  name:'Ar-Rad',        type:'Madaniyah', ayat:43  },
  { id:14,  name:'Ibrahim',       type:'Makkiyah',  ayat:52  },
  { id:15,  name:'Al-Hijr',       type:'Makkiyah',  ayat:99  },
  { id:16,  name:'An-Nahl',       type:'Makkiyah',  ayat:128 },
  { id:17,  name:'Al-Isra',       type:'Makkiyah',  ayat:111 },
  { id:18,  name:'Al-Kahf',       type:'Makkiyah',  ayat:110 },
  { id:19,  name:'Maryam',        type:'Makkiyah',  ayat:98  },
  { id:20,  name:'Taha',          type:'Makkiyah',  ayat:135 },
  { id:21,  name:'Al-Anbiya',     type:'Makkiyah',  ayat:112 },
  { id:22,  name:'Al-Hajj',       type:'Madaniyah', ayat:78  },
  { id:23,  name:'Al-Muminun',    type:'Makkiyah',  ayat:118 },
  { id:24,  name:'An-Nur',        type:'Madaniyah', ayat:64  },
  { id:25,  name:'Al-Furqan',     type:'Makkiyah',  ayat:77  },
  { id:26,  name:'Asy-Syuara',    type:'Makkiyah',  ayat:227 },
  { id:27,  name:'An-Naml',       type:'Makkiyah',  ayat:93  },
  { id:28,  name:'Al-Qasas',      type:'Makkiyah',  ayat:88  },
  { id:29,  name:'Al-Ankabut',    type:'Makkiyah',  ayat:69  },
  { id:30,  name:'Ar-Rum',        type:'Makkiyah',  ayat:60  },
  { id:31,  name:'Luqman',        type:'Makkiyah',  ayat:34  },
  { id:32,  name:'As-Sajdah',     type:'Makkiyah',  ayat:30  },
  { id:33,  name:'Al-Ahzab',      type:'Madaniyah', ayat:73  },
  { id:34,  name:'Saba',          type:'Makkiyah',  ayat:54  },
  { id:35,  name:'Fatir',         type:'Makkiyah',  ayat:45  },
  { id:36,  name:'Yasin',         type:'Makkiyah',  ayat:83  },
  { id:37,  name:'As-Saffat',     type:'Makkiyah',  ayat:182 },
  { id:38,  name:'Sad',           type:'Makkiyah',  ayat:88  },
  { id:39,  name:'Az-Zumar',      type:'Makkiyah',  ayat:75  },
  { id:40,  name:'Ghafir',        type:'Makkiyah',  ayat:85  },
  { id:41,  name:'Fussilat',      type:'Makkiyah',  ayat:54  },
  { id:42,  name:'Asy-Syura',     type:'Makkiyah',  ayat:53  },
  { id:43,  name:'Az-Zukhruf',    type:'Makkiyah',  ayat:89  },
  { id:44,  name:'Ad-Dukhan',     type:'Makkiyah',  ayat:59  },
  { id:45,  name:'Al-Jasiyah',    type:'Makkiyah',  ayat:37  },
  { id:46,  name:'Al-Ahqaf',      type:'Makkiyah',  ayat:35  },
  { id:47,  name:'Muhammad',      type:'Madaniyah', ayat:38  },
  { id:48,  name:'Al-Fath',       type:'Madaniyah', ayat:29  },
  { id:49,  name:'Al-Hujurat',    type:'Madaniyah', ayat:18  },
  { id:50,  name:'Qaf',           type:'Makkiyah',  ayat:45  },
  { id:51,  name:'Az-Zariyat',    type:'Makkiyah',  ayat:60  },
  { id:52,  name:'At-Tur',        type:'Makkiyah',  ayat:49  },
  { id:53,  name:'An-Najm',       type:'Makkiyah',  ayat:62  },
  { id:54,  name:'Al-Qamar',      type:'Makkiyah',  ayat:55  },
  { id:55,  name:'Ar-Rahman',     type:'Madaniyah', ayat:78  },
  { id:56,  name:'Al-Waqiah',     type:'Makkiyah',  ayat:96  },
  { id:57,  name:'Al-Hadid',      type:'Madaniyah', ayat:29  },
  { id:58,  name:'Al-Mujadilah',  type:'Madaniyah', ayat:22  },
  { id:59,  name:'Al-Hasyr',      type:'Madaniyah', ayat:24  },
  { id:60,  name:'Al-Mumtahanah', type:'Madaniyah', ayat:13  },
  { id:61,  name:'As-Saff',       type:'Madaniyah', ayat:14  },
  { id:62,  name:'Al-Jumuah',     type:'Madaniyah', ayat:11  },
  { id:63,  name:'Al-Munafiqun',  type:'Madaniyah', ayat:11  },
  { id:64,  name:'At-Tagabun',    type:'Madaniyah', ayat:18  },
  { id:65,  name:'At-Talaq',      type:'Madaniyah', ayat:12  },
  { id:66,  name:'At-Tahrim',     type:'Madaniyah', ayat:12  },
  { id:67,  name:'Al-Mulk',       type:'Makkiyah',  ayat:30  },
  { id:68,  name:'Al-Qalam',      type:'Makkiyah',  ayat:52  },
  { id:69,  name:'Al-Haqqah',     type:'Makkiyah',  ayat:52  },
  { id:70,  name:'Al-Maarij',     type:'Makkiyah',  ayat:44  },
  { id:71,  name:'Nuh',           type:'Makkiyah',  ayat:28  },
  { id:72,  name:'Al-Jin',        type:'Makkiyah',  ayat:28  },
  { id:73,  name:'Al-Muzzammil',  type:'Makkiyah',  ayat:20  },
  { id:74,  name:'Al-Muddassir',  type:'Makkiyah',  ayat:56  },
  { id:75,  name:'Al-Qiyamah',    type:'Makkiyah',  ayat:40  },
  { id:76,  name:'Al-Insan',      type:'Madaniyah', ayat:31  },
  { id:77,  name:'Al-Mursalat',   type:'Makkiyah',  ayat:50  },
  { id:78,  name:'An-Naba',       type:'Makkiyah',  ayat:40  },
  { id:79,  name:'An-Naziat',     type:'Makkiyah',  ayat:46  },
  { id:80,  name:'Abasa',         type:'Makkiyah',  ayat:42  },
  { id:81,  name:'At-Takwir',     type:'Makkiyah',  ayat:29  },
  { id:82,  name:'Al-Infitar',    type:'Makkiyah',  ayat:19  },
  { id:83,  name:'Al-Mutaffifin', type:'Makkiyah',  ayat:36  },
  { id:84,  name:'Al-Insyiqaq',   type:'Makkiyah',  ayat:25  },
  { id:85,  name:'Al-Buruj',      type:'Makkiyah',  ayat:22  },
  { id:86,  name:'At-Tariq',      type:'Makkiyah',  ayat:17  },
  { id:87,  name:'Al-Ala',        type:'Makkiyah',  ayat:19  },
  { id:88,  name:'Al-Gasyiyah',   type:'Makkiyah',  ayat:26  },
  { id:89,  name:'Al-Fajr',       type:'Makkiyah',  ayat:30  },
  { id:90,  name:'Al-Balad',      type:'Makkiyah',  ayat:20  },
  { id:91,  name:'Asy-Syams',     type:'Makkiyah',  ayat:15  },
  { id:92,  name:'Al-Lail',       type:'Makkiyah',  ayat:21  },
  { id:93,  name:'Ad-Duha',       type:'Makkiyah',  ayat:11  },
  { id:94,  name:'Al-Insyirah',   type:'Makkiyah',  ayat:8   },
  { id:95,  name:'At-Tin',        type:'Makkiyah',  ayat:8   },
  { id:96,  name:'Al-Alaq',       type:'Makkiyah',  ayat:19  },
  { id:97,  name:'Al-Qadr',       type:'Makkiyah',  ayat:5   },
  { id:98,  name:'Al-Bayyinah',   type:'Madaniyah', ayat:8   },
  { id:99,  name:'Az-Zalzalah',   type:'Madaniyah', ayat:8   },
  { id:100, name:'Al-Adiyat',     type:'Makkiyah',  ayat:11  },
  { id:101, name:'Al-Qariah',     type:'Makkiyah',  ayat:11  },
  { id:102, name:'At-Takasur',    type:'Makkiyah',  ayat:8   },
  { id:103, name:'Al-Asr',        type:'Makkiyah',  ayat:3   },
  { id:104, name:'Al-Humazah',    type:'Makkiyah',  ayat:9   },
  { id:105, name:'Al-Fil',        type:'Makkiyah',  ayat:5   },
  { id:106, name:'Quraisy',       type:'Makkiyah',  ayat:4   },
  { id:107, name:'Al-Maun',       type:'Makkiyah',  ayat:7   },
  { id:108, name:'Al-Kausar',     type:'Makkiyah',  ayat:3   },
  { id:109, name:'Al-Kafirun',    type:'Makkiyah',  ayat:6   },
  { id:110, name:'An-Nasr',       type:'Madaniyah', ayat:3   },
  { id:111, name:'Al-Lahab',      type:'Makkiyah',  ayat:5   },
  { id:112, name:'Al-Ikhlas',     type:'Makkiyah',  ayat:4   },
  { id:113, name:'Al-Falaq',      type:'Makkiyah',  ayat:5   },
  { id:114, name:'An-Nas',        type:'Makkiyah',  ayat:6   },
]

// Juz 1-30 dengan jumlah surah per juz
const JUZ_DATA: JuzItem[] = [
  {juz:1,surahCount:2},{juz:2,surahCount:1},{juz:3,surahCount:2},{juz:4,surahCount:2},{juz:5,surahCount:2},
  {juz:6,surahCount:2},{juz:7,surahCount:2},{juz:8,surahCount:2},{juz:9,surahCount:2},{juz:10,surahCount:2},
  {juz:11,surahCount:2},{juz:12,surahCount:2},{juz:13,surahCount:3},{juz:14,surahCount:3},{juz:15,surahCount:3},
  {juz:16,surahCount:3},{juz:17,surahCount:4},{juz:18,surahCount:4},{juz:19,surahCount:5},{juz:20,surahCount:4},
  {juz:21,surahCount:4},{juz:22,surahCount:5},{juz:23,surahCount:5},{juz:24,surahCount:5},{juz:25,surahCount:5},
  {juz:26,surahCount:6},{juz:27,surahCount:6},{juz:28,surahCount:8},{juz:29,surahCount:11},{juz:30,surahCount:37},
]

// ════════════════════════════════════════════════════════════════════════════
export default function QuranClient({ userProfile }: Props) {
  const router = useRouter()

  const [activeTab,   setActiveTab]   = useState<'tahfidz' | 'tahsin'>('tahfidz')
  const [filterMode,  setFilterMode]  = useState<'none' | 'juz' | 'surah'>('none')
  const [surahs,      setSurahs]      = useState<SurahItem[]>(SURAH_FALLBACK)
  const [apiLoaded,   setApiLoaded]   = useState(false)

  // filter inputs
  const [surahSearch, setSurahSearch] = useState('')
  const [ayatAwal,    setAyatAwal]    = useState('')
  const [ayatAkhir,   setAyatAkhir]   = useState('')
  const [juzAwal,     setJuzAwal]     = useState('')
  const [juzAkhir,    setJuzAkhir]    = useState('')

  // ── Fetch 114 surah dari alquran.cloud dengan tipe data aman ──────
  useEffect(() => {
    QuranService.getSurahs()
      .then((data: unknown) => {
        if (!Array.isArray(data) || !data.length) return
        
        // Melakukan casting aman setelah memastikan datanya berupa array
        const typedData = data as ApiSurahItem[]
        
        const mapped: SurahItem[] = typedData.map((s) => ({
          id:   Number(s.number),
          name: String(s.englishName),
          type: String(s.revelationType) === 'Meccan' ? 'Makkiyah' : 'Madaniyah',
          ayat: Number(s.numberOfAyahs),
        }))
        setSurahs(mapped)
        setApiLoaded(true)
      })
      .catch(() => setApiLoaded(true))
  }, [])

  // ── Preview card — nama surah diketik persis ──────────────────────
  const previewSurah = useMemo((): (SurahItem & { ayatLabel: string }) | null => {
    if (!surahSearch || filterMode !== 'surah') return null
    const found = surahs.find(
      s => s.name.toLowerCase() === surahSearch.toLowerCase()
    )
    if (!found) return null
    const a = parseInt(ayatAwal)
    const b = parseInt(ayatAkhir)
    return {
      ...found,
      ayatLabel: a && b ? `Ayat ${a}-${b}` : a ? `Ayat ${a}` : String(found.ayat),
    }
  }, [surahSearch, ayatAwal, ayatAkhir, filterMode, surahs])

  // ── Daftar surah yang ditampilkan (grid) ─────────────────────────
  const displaySurahs = useMemo((): SurahItem[] => {
    if (filterMode !== 'surah') return surahs
    if (!surahSearch) return surahs
    return surahs.filter(s =>
      s.name.toLowerCase().includes(surahSearch.toLowerCase())
    )
  }, [surahs, surahSearch, filterMode])

  // ── Daftar juz yang ditampilkan ──────────────────────────────────
  const displayJuz = useMemo((): JuzItem[] => {
    if (filterMode !== 'juz') return JUZ_DATA
    const a = parseInt(juzAwal)  || 1
    const b = parseInt(juzAkhir) || 30
    return JUZ_DATA.filter(j => j.juz >= a && j.juz <= b)
  }, [juzAwal, juzAkhir, filterMode])

  // ── Navigate ke halaman setoran ──────────────────────────────────
  const goToSurah = (id: number, start?: number, end?: number): void => {
    const surah = surahs.find(s => s.id === id)
    const s = start ?? 1
    const e = end   ?? surah?.ayat ?? 7
    router.push(`/quran/${activeTab}/${id}?start=${s}&end=${e}`)
  }

  // ── Toggle filter mode ────────────────────────────────────────────
  const toggleFilter = (mode: 'juz' | 'surah'): void => {
    if (filterMode === mode) {
      setFilterMode('none')
    } else {
      setFilterMode(mode)
    }
    setSurahSearch(''); setAyatAwal(''); setAyatAkhir('')
    setJuzAwal('');    setJuzAkhir('')
  }

  return (
    <div className="min-h-screen bg-white font-['Poppins',sans-serif]">

      {/* ════════════════════════════════════════════════
          HERO — warna hijau gelap sesuai desain
      ════════════════════════════════════════════════ */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5c38 0%, #1d7a52 60%, #1a6040 100%)' }}
      >
        {/* Ornamen bulan sabit kiri */}
        <div className="absolute left-4 bottom-0 opacity-20 pointer-events-none select-none">
          <svg width="220" height="320" viewBox="0 0 220 320" fill="none">
            <path d="M80 280 Q-20 200 30 100 Q80 0 160 20 Q100 40 80 120 Q60 200 120 280 Z"
              fill="white" opacity="0.3" />
            <circle cx="60" cy="60" r="50" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
            <circle cx="60" cy="60" r="35" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M20 120 Q60 80 100 100 Q80 140 40 160 Z" fill="white" opacity="0.15" />
          </svg>
        </div>

        {/* Kaligrafi Arab kanan */}
        <div
          className="absolute right-6 top-8 opacity-15 pointer-events-none select-none"
          style={{ fontFamily: 'serif', fontSize: '96px', color: 'white', lineHeight: 1 }}
        >
          ﷽
        </div>

        {/* Konten teks */}
        <div className="relative z-10 text-center px-6 pt-28 pb-8 max-w-2xl mx-auto">
          <p className="text-[#d3ad0f] text-[13px] font-semibold uppercase tracking-[0.25em] mb-3">
            Sahabat Qur'an
          </p>
          <h1 className="text-[38px] md:text-[46px] font-bold leading-tight mb-4">
            Ngaji Bareng Sahabat Qur'an
          </h1>
          <p className="text-white/80 text-[15px] leading-relaxed max-w-lg mx-auto">
            Sahabat Quran adalah ruang untuk bertanya, berbagi, dan belajar Islam
            bersama secara nyaman dan saling menghargai.
          </p>
        </div>

        {/* ── Tab Tahfidz / Tahsin sesuai desain ── */}
        <div className="relative z-10 max-w-[900px] mx-auto px-6">
          <div className="grid grid-cols-2 rounded-t-2xl overflow-hidden border border-white/20">
            <button
              onClick={() => setActiveTab('tahfidz')}
              className={`py-4 text-[15px] font-bold transition-all ${
                activeTab === 'tahfidz'
                  ? 'bg-[#1d7a52] text-white'
                  : 'bg-transparent text-[#d3ad0f] hover:bg-white/5'
              }`}
            >
              Tahfidz
            </button>
            <button
              onClick={() => setActiveTab('tahsin')}
              className={`py-4 text-[15px] font-bold transition-all ${
                activeTab === 'tahsin'
                  ? 'bg-[#1d7a52] text-white'
                  : 'bg-transparent text-[#d3ad0f] hover:bg-white/5'
              }`}
            >
              Tahsin
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FILTER + GRID
      ════════════════════════════════════════════════ */}
      <section className="max-w-[900px] mx-auto px-6 py-8 pb-20">

        {/* ── Toggle Pilih PerJuz / Pilih Persurat sesuai desain ── */}
        <div className="grid grid-cols-2 gap-0 mb-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">

          {/* Pilih PerJuz */}
          <button
            onClick={() => toggleFilter('juz')}
            className={`flex items-center gap-3 px-5 py-4 text-[14px] font-medium transition-all ${
              filterMode === 'juz'
                ? 'bg-[#e8f5ee] text-[#157a52]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              filterMode === 'juz'
                ? 'border-[#157a52] bg-[#157a52]'
                : 'border-gray-300 bg-white'
            }`}>
              {filterMode === 'juz' && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            Pilih PerJuz
          </button>

          {/* Pilih Persurat */}
          <button
            onClick={() => toggleFilter('surah')}
            className={`flex items-center gap-3 px-5 py-4 text-[14px] font-medium border-l border-gray-200 transition-all ${
              filterMode === 'surah'
                ? 'bg-[#e8f5ee] text-[#157a52]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              filterMode === 'surah'
                ? 'border-[#157a52] bg-[#157a52]'
                : 'border-gray-300 bg-white'
            }`}>
              {filterMode === 'surah' && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            Pilih Persurat
          </button>
        </div>

        {/* ── Input PerJuz (Juz Awal / Juz Akhir) ── */}
        {filterMode === 'juz' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[13px] text-gray-600 mb-2">Juz Awal</label>
              <input
                type="number" min={1} max={30}
                placeholder="Masukkan juz awal"
                value={juzAwal}
                onChange={e => setJuzAwal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
              />
            </div>
            <div>
              <label className="block text-[13px] text-gray-600 mb-2">Juz Akhir</label>
              <input
                type="number" min={1} max={30}
                placeholder="Masukkan juz akhir"
                value={juzAkhir}
                onChange={e => setJuzAkhir(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
              />
            </div>
          </div>
        )}

        {/* ── Input Persurat (Nama Surat + Ayat) ── */}
        {filterMode === 'surah' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[13px] text-gray-600 mb-2">Nama Surat</label>
              <input
                type="text"
                placeholder="Masukkan nama surah"
                value={surahSearch}
                onChange={e => setSurahSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
              />
            </div>
            <div>
              <label className="block text-[13px] text-gray-600 mb-2">Nomor Awal Ayat</label>
              <input
                type="number" min={1}
                placeholder="Masukkan nomor ayat"
                value={ayatAwal}
                onChange={e => setAyatAwal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
              />
            </div>
            <div>
              <label className="block text-[13px] text-gray-600 mb-2">Nomor Akhir Ayat</label>
              <input
                type="number" min={1}
                placeholder="Masukkan nomor ayat"
                value={ayatAkhir}
                onChange={e => setAyatAkhir(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
              />
            </div>
          </div>
        )}

        {/* ── Preview card — muncul saat nama surah cocok persis ── */}
        {previewSurah && (
          <button
            onClick={() => goToSurah(
              previewSurah.id,
              parseInt(ayatAwal)  || 1,
              parseInt(ayatAkhir) || previewSurah.ayat,
            )}
            className="w-full flex items-center justify-between px-6 py-5 mb-6 bg-[#e8f5ee] border-2 border-[#157a52] rounded-2xl hover:bg-[#d5ece0] transition-all text-left"
          >
            <div>
              <p className="text-[16px] font-bold text-[#0c1421]">{previewSurah.name}</p>
              <p className="text-[13px] text-gray-500 mt-0.5">{previewSurah.type}</p>
            </div>
            <div className="text-right">
              <p className="text-[28px] font-bold text-[#0c1421] leading-none">{previewSurah.ayatLabel}</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Ayat</p>
            </div>
          </button>
        )}

        {/* ── Loading skeleton ── */}
        {!apiLoaded && filterMode !== 'juz' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-[76px] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Grid Surah — 3 kolom sesuai desain, semua 114 surah ── */}
        {filterMode !== 'juz' && !previewSurah && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {displaySurahs.map(s => (
              <button
                key={s.id}
                onClick={() => goToSurah(s.id)}
                className="flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-[#157a52]/40 hover:shadow-md hover:bg-[#f8fffe] transition-all text-left group"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#0c1421] group-hover:text-[#157a52] transition-colors truncate">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{s.type}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[26px] font-bold text-[#0c1421] leading-none">{s.ayat}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ayat</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Grid Juz — 30 juz ── */}
        {filterMode === 'juz' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {displayJuz.map(j => (
              <button
                key={j.juz}
                onClick={() => router.push(`/quran/${activeTab}/1?juz=${j.juz}`)}
                className="flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-[#157a52]/40 hover:shadow-md hover:bg-[#f8fffe] transition-all text-left group"
              >
                <div>
                  <p className="text-[15px] font-bold text-[#0c1421] group-hover:text-[#157a52] transition-colors">
                    Juz {j.juz}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[22px] font-bold text-[#0c1421] leading-none">{j.surahCount}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Surah</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}