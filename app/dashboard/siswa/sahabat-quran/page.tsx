  'use client';

  import { useState, useEffect } from 'react';
  import { Search, ListFilter, BookOpen, Hash, ChevronRight, Sparkles } from 'lucide-react';
  import { QuranService } from '@/lib/quran-service';
  import { AyatItem } from '../../../../components/AyatItems';

  export default function QuranHubPage() {
    const [activeTab, setActiveTab] = useState<'tahsin' | 'tahfidz'>('tahsin');
    const [filterMode, setFilterMode] = useState<'surah' | 'juz'>('surah');
    const [surahs, setSurahs] = useState<any[]>([]);
    const [ayats, setAyats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [playingAyat, setPlayingAyat] = useState<number | null>(null);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [audio] = useState<HTMLAudioElement | null>(
      typeof Audio !== "undefined" ? new Audio() : null
    );
  
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [range, setRange] = useState({ start: 1, end: 10 });
    const [juzRange, setJuzRange] = useState({ start: 1, end: 1 });

    useEffect(() => {
      QuranService.getSurahs().then(setSurahs);
      handleApplyFilter();
      
      
      const saved = localStorage.getItem('bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    }, []);

   
    const handlePlay = (num: number) => {
      if (!audio) return;
      if (playingAyat === num) {
        audio.pause();
        setPlayingAyat(null);
      } else {
  
        audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${num}.mp3`;
        audio.play();
        setPlayingAyat(num);
        audio.onended = () => setPlayingAyat(null);
      }
    };

    const toggleBookmark = (ayat: any) => {
      let newBooks = [...bookmarks];
      const idx = newBooks.findIndex((b) => b.number === ayat.number);
      if (idx > -1) {
        newBooks.splice(idx, 1);
      } else {
        newBooks.push(ayat);
      }
      setBookmarks(newBooks);
      localStorage.setItem('bookmarks', JSON.stringify(newBooks));
    };


    const handleApplyFilter = async () => {
      setLoading(true);
      try {
        let data;
        if (filterMode === 'surah') {
          const fullData = await QuranService.getSurahDetail(selectedSurah);
          data = fullData.slice(range.start - 1, range.end);
        } else {
        
          console.log("Fetching Juz:", juzRange);
        }
        setAyats(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="w-full bg-[#FDFDFD] min-h-screen flex flex-col">
        
        <div className={`w-full transition-all duration-700 bg-gradient-to-br ${
          activeTab === 'tahsin' ? 'from-emerald-900 to-emerald-600 shadow-emerald-900/20' : 'from-blue-900 to-blue-600 shadow-blue-900/20'
        } px-6 sm:px-12 py-16 text-white shadow-2xl`}>
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-[10px] font-black tracking-[0.4em] opacity-60 uppercase">Sahabat Quran</p>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                Ngaji Bareng <br/> <span className={activeTab === 'tahsin' ? 'text-emerald-300' : 'text-blue-300'}>{activeTab}</span>
              </h1>
              <p className="max-w-md text-xs font-medium opacity-70 leading-relaxed pt-4">
                Ruang untuk bertanya, berbagi, dan belajar Islam bersama secara nyaman dan saling menghargai.
              </p>
            </div>
            
            <div className="flex bg-black/20 backdrop-blur-xl p-2 rounded-[32px] border border-white/10 shadow-inner w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('tahfidz')}
                className={`flex-1 md:w-48 py-4 rounded-[26px] text-xs font-black transition-all ${activeTab === 'tahfidz' ? 'bg-white text-blue-900 shadow-xl scale-105' : 'text-white/60 hover:text-white'}`}
              >
                TAHFIDZ
              </button>
              <button 
                onClick={() => setActiveTab('tahsin')}
                className={`flex-1 md:w-48 py-4 rounded-[26px] text-xs font-black transition-all ${activeTab === 'tahsin' ? 'bg-white text-emerald-900 shadow-xl scale-105' : 'text-white/60 hover:text-white'}`}
              >
                TAHSIN
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-6 sm:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
   
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28 self-start">
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                  <ListFilter size={12} /> Filter Tampilan
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFilterMode('surah')}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[24px] text-[10px] font-black transition-all border-2 ${
                      filterMode === 'surah' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    <BookOpen size={20} /> PER SURAH
                  </button>
                  <button 
                    onClick={() => setFilterMode('juz')}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[24px] text-[10px] font-black transition-all border-2 ${
                      filterMode === 'juz' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400'
                    }`}
                  >
                    <Hash size={20} /> PER JUZ
                  </button>
                </div>
              </div>

              <hr className="border-slate-50" />

              <div className="space-y-6">
                {filterMode === 'juz' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FilterInput label="JUZ AWAL" value={juzRange.start} onChange={(val) => setJuzRange({...juzRange, start: val})} />
                    <FilterInput label="JUZ AKHIR" value={juzRange.end} onChange={(val) => setJuzRange({...juzRange, end: val})} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 px-2 tracking-widest">PILIH SURAH</label>
                      <select 
                        value={selectedSurah}
                        onChange={(e) => setSelectedSurah(Number(e.target.value))}
                        className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                      >
                        {surahs.map(s => <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FilterInput label="AYAT AWAL" value={range.start} onChange={(val) => setRange({...range, start: val})} />
                      <FilterInput label="AYAT AKHIR" value={range.end} onChange={(val) => setRange({...range, end: val})} />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleApplyFilter}
                  className="w-full py-5 bg-[#064E3B] text-white rounded-[28px] text-[11px] font-black shadow-xl shadow-emerald-900/30 hover:bg-[#043629] hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center py-40 gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 border-opacity-20 border-t-opacity-100"></div>
                <p className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-[0.3em]">Menyiapkan Ayat...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ayats.map((ayat) => (
                  <AyatItem 
                    key={ayat.number}
                    ayat={ayat}
                    isPlaying={playingAyat === ayat.number}
                    isBookmarked={bookmarks.some((b) => b.number === ayat.number)}
                    onPlay={handlePlay}
                    onBookmark={() => toggleBookmark(ayat)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function FilterInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 px-2 tracking-widest">{label}</label>
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
        />
      </div>
    );
  }