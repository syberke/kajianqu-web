  'use client';

  import { useState, useEffect } from 'react';
  import { supabase } from '@/lib/supabase'; 
  import { 
    BookOpen, 
    Mic, 
    PlayCircle, 
    Star, 
    Clock,
    ArrowUpRight,
    TrendingUp,
    Award,
    Bell
  } from 'lucide-react';
  import Link from 'next/link';

  export default function UserDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [lastSession, setLastSession] = useState<any>(null);
    const [prayerTime, setPrayerTime] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function getDashboardData() {
        setLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            setProfile(prof);

            const { data: session } = await supabase
              .from('quran_ai_sessions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            setLastSession(session);
          }
          
          setPrayerTime({ next: 'Ashar', time: '15:24', city: 'Bekasi' });
        } catch (err) {
          console.error("Dashboard Error:", err);
        } finally {
          setLoading(false);
        }
      }

      getDashboardData();
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#1D794E]"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAF9] pb-20">
        
        {/* --- SECTION 1: WELCOME HEADER --- */}
        {/* z-0 agar background tetap di lapisan paling bawah */}
        <div className="bg-[#064E3B] pt-16 pb-44 px-8 rounded-b-[60px] relative overflow-hidden z-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-emerald-300 mb-2">
                <Bell size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">KajianQu Update</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                Assalamu'alaikum, <br/>
                <span className="text-emerald-400">{profile?.nama?.split(' ')[0] || 'Sahabat'}!</span>
              </h1>
              <p className="text-emerald-100/60 font-medium">Semoga hari ini penuh keberkahan untukmu.</p>
            </div>

            {/* Jadwal Sholat Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] flex items-center gap-6 text-white min-w-[300px] shadow-2xl">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Sholat Selanjutnya</p>
                <h3 className="text-2xl font-black">{prayerTime?.next} • {prayerTime?.time}</h3>
                <p className="text-[10px] font-bold opacity-60 uppercase">{prayerTime?.city}, Indonesia</p>
              </div>
            </div>
          </div>
          
          {/* Dekorasi Glow - z-0 agar tidak menutupi klik tombol */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full -mr-40 -mt-40 z-0"></div>
        </div>

        {/* --- CONTENT WRAPPER --- */}
        {/* -mt-24 dan relative z-10 untuk menaikkan kartu ke atas header hijau */}
        <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10 space-y-10">
          
          {/* --- SECTION 2: QUICK ACCESS GRID --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <QuickCard icon={<BookOpen />} label="Baca Quran" href="/sahabat-quran" color="bg-emerald-600" />
            <QuickCard icon={<Mic />} label="Tahfidz AI" href="/sahabat-quran" color="bg-blue-600" />
            <QuickCard icon={<PlayCircle />} label="Keilmuan" href="/keilmuan" color="bg-orange-600" />
            <QuickCard icon={<Star />} label="Infaq" href="/donation" color="bg-rose-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- SECTION 3: LAST LEARNING PROGRESS --- */}
            <div className="lg:col-span-2 space-y-6">
              <h4 className="font-black text-emerald-900 text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> 
                Lanjutkan Hafalan
              </h4>
              
              <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Mic size={40} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        MODE {lastSession?.mode?.toUpperCase() || 'TAHFIDZ'} • REAL-TIME AI
                      </p>
                      <h3 className="text-2xl font-black text-emerald-900">
                        Surah {lastSession?.surah_no ? `Ke-${lastSession.surah_no}` : 'Al-Mulk'}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">Ayat {lastSession?.ayah_start || 1} - {lastSession?.ayah_end || 10}</p>
                    </div>
                  </div>
                  <Link 
                    href="/sahabat-quran" 
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    MULAI BACA <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* --- SECTION 4: ACHIEVEMENT STATS --- */}
            <div className="space-y-6">
              <h4 className="font-black text-emerald-900 text-lg">Statistik Kamu</h4>
              <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
                <StatRow 
                  icon={<PlayCircle size={16} />} 
                  label="Materi Selesai" 
                  value="12" 
                  sub="Video" 
                  color="text-orange-600" 
                />
                <StatRow 
                  icon={<TrendingUp size={16} />} 
                  label="Skor Hafalan" 
                  value="98%" 
                  sub="Akurasi AI" 
                  color="text-emerald-600" 
                />
                <StatRow 
                  icon={<Award size={16} />} 
                  label="Level Belajar" 
                  value="Siswa" 
                  sub="Tahap Awal" 
                  color="text-blue-600" 
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- SUB-COMPONENTS ---

  function QuickCard({ icon, label, href, color }: any) {
    return (
      <Link href={href}>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-4 group cursor-pointer">
          <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
            {icon}
          </div>
          <span className="text-[10px] font-black text-emerald-900 uppercase tracking-tighter">{label}</span>
        </div>
      </Link>
    );
  }

  function StatRow({ label, value, sub, color, icon }: any) {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-[10px] font-medium text-gray-400">{sub}</p>
          </div>
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    );
  }