'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Bookmark, BookOpen, Bot, CircleUserRound, HandCoins, Home, Layers3, LogOut, Menu, MessageCircle, UsersRound, X } from 'lucide-react'
import { useState } from 'react'

import { supabase } from '@/lib/supabase/client'

interface Profile { nama?: string; foto_url?: string | null }

const navigation = [
  { label: 'Dashboard', href: '/dashboard/siswa', icon: Home },
  { label: 'Quran AI', href: '/quran-ai', icon: Bot },
  { label: 'Keilmuan', href: '/keilmuan', icon: BookOpen },
  { label: 'Kelas', href: '/kelas', icon: Layers3 },
  { label: 'Daftar Ustadz', href: '/ustadz', icon: UsersRound },
  { label: 'Chat Ustadz', href: '/dashboard/siswa/chat', icon: MessageCircle },
  { label: 'Notifikasi', href: '/dashboard/siswa/notifications', icon: Bell },
  { label: 'Tersimpan', href: '/dashboard/siswa/favorites', icon: Bookmark },
  { label: 'Donasi', href: '/dashboard/siswa/donation', icon: HandCoins },
  { label: 'Profil', href: '/dashboard/siswa/profile', icon: CircleUserRound },
]

export default function StudentLayoutClient({ children, profile }: { children: React.ReactNode; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/welcome')
    router.refresh()
  }

  const sidebar = <aside className="flex h-full w-72 flex-col bg-[#064E3B] text-white">
    <Link href="/welcome" className="flex items-center gap-3 px-7 py-8"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><BookOpen /></span><span className="text-2xl font-black tracking-tight">KajianQu</span></Link>
    <nav className="flex-1 space-y-2 overflow-y-auto px-4">{navigation.map(({ label, href, icon: Icon }) => {
      const active = href === '/dashboard/siswa' ? pathname === href : pathname.startsWith(href)
      return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition ${active ? 'bg-white text-[#064E3B] shadow-lg' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}><Icon size={20} />{label}</Link>
    })}</nav>
    <div className="border-t border-white/10 p-5"><button onClick={logout} className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold text-red-200 hover:bg-white/10"><LogOut size={20} />Keluar</button></div>
  </aside>

  return <div className="min-h-screen bg-[#f6f8f7] lg:pl-72">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Tutup menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/50" /><div className="relative h-full w-72">{sidebar}<button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-white"><X /></button></div></div>}
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8"><button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-emerald-800 lg:hidden"><Menu /></button><div className="ml-auto flex items-center gap-3"><div className="text-right"><p className="text-sm font-black text-slate-900">{profile?.nama || 'Sahabat KajianQu'}</p><p className="text-xs text-slate-400">Siswa</p></div><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-emerald-100 font-black text-emerald-800">{profile?.foto_url ? <img src={profile.foto_url} alt={profile.nama || 'Profil'} className="h-full w-full object-cover" /> : profile?.nama?.[0] || 'S'}</div></div></header>
    <main className="p-5 sm:p-8 lg:p-10">{children}</main>
  </div>
}
