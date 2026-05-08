'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Hash } from 'lucide-react'
import { QuranService } from '@/lib/quran-service'

interface Props {
  userProfile: any
}

const SURAHS_STATIC = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: `Surah ${i + 1}`,
  englishName: getSurahName(i + 1),
  numberOfAyahs: 7,
  revelationType: i < 86 ? 'Meccan' : 'Medinan',
}))

function getSurahName(n: number): string {
  const names: Record<number, string> = {
    1:'Al-Fatihah',2:'Al-Baqarah',3:'Ali Imran',4:'An-Nisa',5:'Al-Maidah',
    6:'Al-Anam',7:'Al-Araf',8:'Al-Anfal',9:'At-Tawbah',10:'Yunus',
    11:'Hud',12:'Yusuf',13:'Ar-Rad',14:'Ibrahim',15:'Al-Hijr',
    16:'An-Nahl',17:'Al-Isra',18:'Al-Kahf',19:'Maryam',20:'Taha',
    21:'Al-Anbiya',22:'Al-Hajj',23:'Al-Muminun',24:'An-Nur',25:'Al-Furqan',
    26:'Asy-Syuara',27:'An-Naml',28:'Al-Qasas',29:'Al-Ankabut',30:'Ar-Rum',
    31:'Luqman',32:'As-Sajdah',33:'Al-Ahzab',34:'Saba',35:'Fatir',
    36:'Yasin',37:'As-Saffat',38:'Sad',39:'Az-Zumar',40:'Ghafir',
    41:'Fussilat',42:'Asy-Syura',43:'Az-Zukhruf',44:'Ad-Dukhan',45:'Al-Jasiyah',
    46:'Al-Ahqaf',47:'Muhammad',48:'Al-Fath',49:'Al-Hujurat',50:'Qaf',
    51:'Az-Zariyat',52:'At-Tur',53:'An-Najm',54:'Al-Qamar',55:'Ar-Rahman',
    56:'Al-Waqiah',57:'Al-Hadid',58:'Al-Mujadilah',59:'Al-Hasyr',60:'Al-Mumtahanah',
    61:'As-Saff',62:'Al-Jumuah',63:'Al-Munafiqun',64:'At-Tagabun',65:'At-Talaq',
    66:'At-Tahrim',67:'Al-Mulk',68:'Al-Qalam',69:'Al-Haqqah',70:'Al-Maarij',
    71:'Nuh',72:'Al-Jin',73:'Al-Muzzammil',74:'Al-Muddassir',75:'Al-Qiyamah',
    76:'Al-Insan',77:'Al-Mursalat',78:'An-Naba',79:'An-Naziat',80:'Abasa',
    81:'At-Takwir',82:'Al-Infitar',83:'Al-Mutaffifin',84:'Al-Insyiqaq',85:'Al-Buruj',
    86:'At-Tariq',87:'Al-Ala',88:'Al-Gasyiyah',89:'Al-Fajr',90:'Al-Balad',
    91:'Asy-Syams',92:'Al-Lail',93:'Ad-Duha',94:'Al-Insyirah',95:'At-Tin',
    96:'Al-Alaq',97:'Al-Qadr',98:'Al-Bayyinah',99:'Az-Zalzalah',100:'Al-Adiyat',
    101:'Al-Qariah',102:'At-Takasur',103:'Al-Asr',104:'Al-Humazah',105:'Al-Fil',
    106:'Quraisy',107:'Al-Maun',108:'Al-Kausar',109:'Al-Kafirun',110:'An-Nasr',
    111:'Al-Lahab',112:'Al-Ikhlas',113:'Al-Falaq',114:'An-Nas',
  }
  return names[n] || `Surah ${n}`
}

export default function QuranClient({ userProfile }: Props) {
  const [activeTab, setActiveTab] = useState<'tahfidz' | 'tahsin'>('tahfidz')
  const [filterMode, setFilterMode] = useState<'surah' | 'juz'>('surah')
  const [surahs, setSurahs] = useState(SURAHS_STATIC)
  const [search, setSearch] = useState('')

  useEffect(() => {
    QuranService.getSurahs()
      .then(data => { if (data?.length) setSurahs(data) })
      .catch(() => {})
  }, [])

  const filtered = surahs.filter(s =>
    s.englishName?.toLowerCase().includes(search.toLowerCase()) ||
    s.number?.toString().includes(search)
  )

  const getHref = (surahNumber: number) => {
    const base = `/quran/${activeTab}/${surahNumber}`
    return base
  }

  return (
    <div className="bg-white min-h-screen font-['Poppins',sans-serif]">

      {/* HERO */}
      <section className="relative bg-[#157a52] pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <p className="text-[#d3ad0f] text-sm font-bold uppercase tracking-widest">Sahabat Qur'an</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Ngaji Bareng Sahabat Qur'an
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-base leading-relaxed">
            Sahabat Quran adalah ruang untuk bertanya, berbagi, dan belajar Islam bersama secara nyaman dan saling menghargai.
          </p>

          {/* Tab Tahfidz / Tahsin */}
          <div className="flex bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20 max-w-sm mx-auto mt-8">
            <button
              onClick={() => setActiveTab('tahfidz')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tahfidz' ? 'bg-[#157a52] text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
            >
              Tahfidz
            </button>
            <button
              onClick={() => setActiveTab('tahsin')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tahsin' ? 'bg-[#157a52] text-white shadow-lg' : 'text-white/70 hover:text-white'}`}
            >
              Tahsin
            </button>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => setFilterMode('surah')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${filterMode === 'surah' ? 'border-[#157a52] bg-[#e8f5ee] text-[#157a52]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <BookOpen size={16} /> Pilih Persurat
            </button>
            <button
              onClick={() => setFilterMode('juz')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${filterMode === 'juz' ? 'border-[#157a52] bg-[#e8f5ee] text-[#157a52]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <Hash size={16} /> Pilih PerJuz
            </button>
          </div>
          <input
            type="text"
            placeholder="Cari surah..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#157a52] focus:ring-2 focus:ring-[#157a52]/10"
          />
        </div>

        {/* SURAH GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(surah => (
            <Link
              key={surah.number}
              href={getHref(surah.number)}
              className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#157a52]/40 hover:shadow-md hover:bg-[#f8fffe] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center text-[#157a52] font-bold text-sm group-hover:bg-[#157a52] group-hover:text-white transition-all">
                  {surah.number}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm group-hover:text-[#157a52] transition-colors">
                    {surah.englishName}
                  </p>
                  <p className="text-xs text-gray-400">{surah.revelationType || 'Makkiyah'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#157a52] text-lg">{surah.numberOfAyahs || 7}</p>
                <p className="text-[10px] text-gray-400 uppercase">Ayat</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}