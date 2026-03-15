'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  Video, BookOpen, MessageSquare, Users, 
  LayoutDashboard, LogOut, Bell, Search 
} from 'lucide-react';

export default function AsatidzLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#064E3B] rounded-xl flex items-center justify-center text-white">
            <BookOpen size={22} />
          </div>
          <span className="font-black text-2xl text-[#064E3B] tracking-tighter">KajianQu</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard/asatidz" active={pathname === '/dashboard/asatidz'} />
          <SidebarItem icon={<BookOpen size={20} />} label="Keilmuan" href="/dashboard/asatidz/keilmuan" active={pathname.includes('/keilmuan')} />
          <SidebarItem icon={<Video size={20} />} label="Live Streaming" href="/dashboard/asatidz/live" active={pathname.includes('/live')} />
          <SidebarItem icon={<MessageSquare size={20} />} label="Chat" href="/dashboard/asatidz/chat" active={pathname.includes('/chat')} badge="5" />
          <SidebarItem icon={<Users size={20} />} label="Profile" href="/dashboard/asatidz/profile" active={pathname.includes('/profile')} />
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 ml-72">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input type="text" placeholder="Cari..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-gray-400"><Bell size={20} /></button>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-xs font-black text-emerald-950">{profile?.nama || 'Ustadz'}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Asatidz</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#064E3B] flex items-center justify-center text-white font-black text-sm">
                {profile?.nama?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, href, active, badge }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center justify-between px-6 py-4 rounded-2xl cursor-pointer transition-all group ${active ? 'bg-[#064E3B] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-emerald-900'}`}>
        <div className="flex items-center gap-4">
          <div className={active ? 'text-emerald-400' : ''}>{icon}</div>
          <span className={`text-sm ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
        </div>
        {badge && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
    </Link>
  );
}