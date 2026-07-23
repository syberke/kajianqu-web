'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  Video, BookOpen, MessageSquare, Users,
  LayoutDashboard, LogOut, Bell, Search, Menu, X, ShieldAlert, ArrowRight, WalletCards, HandHeart
} from 'lucide-react'

interface Profile {
  id?: string
  nama?: string
  email?: string
  foto_url?: string
  role?: string
}

interface AsatidzAccess {
  approved: boolean
  status: string
  asatidzCode: string | null
  reviewNote: string | null
  submittedAt: string | null
}

export default function AsatidzLayoutClient({
  children,
  profile,
  access,
}: {
  children: React.ReactNode
  profile: Profile | null
  access: AsatidzAccess
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const profilePath = '/dashboard/asatidz/profile'
  const showGate = !access.approved && pathname !== profilePath

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-gray-100 bg-white lg:flex">
        <Sidebar pathname={pathname} access={access} onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" />
          <aside className="relative flex h-full w-[min(86vw,288px)] flex-col bg-white shadow-2xl">
            <button type="button" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 z-10 rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            <Sidebar pathname={pathname} access={access} onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-3 border-b border-gray-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Buka menu" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"><Menu size={20} /></button>
            <div className="relative hidden w-full max-w-80 sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Cari..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none"
            />
            </div>
            <div className="min-w-0 sm:hidden">
              <p className="truncate text-sm font-black text-emerald-950">{pathname.includes('/profile') ? 'Profil Asatidz' : 'Dashboard Asatidz'}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{statusLabel(access.status)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-5">
            <Link href="/dashboard/asatidz/notifications" aria-label="Buka notifikasi" className="p-2 text-gray-400"><Bell size={20} /></Link>
            <div className="flex items-center gap-3 border-l pl-3 sm:pl-5">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black text-emerald-950">{profile?.nama || 'Ustadz'}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{access.approved ? 'Asatidz terverifikasi' : statusLabel(access.status)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#064E3B] flex items-center justify-center text-white font-black text-sm overflow-hidden">
                {profile?.foto_url
                  ? <img src={profile.foto_url} alt={profile.nama} className="w-full h-full object-cover" />
                  : <span>{profile?.nama?.[0] || 'U'}</span>
                }
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-10">
          {showGate ? <AsatidzAccessGate access={access} /> : children}
        </main>
      </div>
    </div>
  )
}

function Sidebar({ pathname, access, onNavigate, onLogout }: {
  pathname: string
  access: AsatidzAccess
  onNavigate: () => void
  onLogout: () => void
}) {
  const locked = !access.approved
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 p-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064E3B] text-white"><BookOpen size={22} /></div>
          <span className="text-2xl font-black tracking-tighter text-[#064E3B]">KajianQu</span>
        </div>
        {!access.approved && (
          <div className="mx-4 mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Akses terbatas</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">{statusLabel(access.status)}</p>
          </div>
        )}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-5">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard/asatidz" active={pathname === '/dashboard/asatidz'} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<BookOpen size={20} />} label="Keilmuan" href="/dashboard/asatidz/keilmuan" active={pathname.includes('/keilmuan')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<Video size={20} />} label="Live Streaming" href="/dashboard/asatidz/live" active={pathname.includes('/live')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<Users size={20} />} label="Kelas Private" href="/dashboard/asatidz/private" active={pathname.includes('/private')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<MessageSquare size={20} />} label="Chat" href="/dashboard/asatidz/chat" active={pathname.includes('/chat')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<WalletCards size={20} />} label="Fee & Pendapatan" href="/dashboard/asatidz/earnings" active={pathname.includes('/earnings')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<HandHeart size={20} />} label="Infaq & Shadaqah" href="/dashboard/asatidz/donation" active={pathname.includes('/donation')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<Bell size={20} />} label="Notifikasi" href="/dashboard/asatidz/notifications" active={pathname.includes('/notifications')} locked={locked} onNavigate={onNavigate} />
          <SidebarItem icon={<Users size={20} />} label="Profil & Verifikasi" href="/dashboard/asatidz/profile" active={pathname.includes('/profile')} onNavigate={onNavigate} />
        </nav>
      </div>
      <div className="border-t border-gray-50 p-6">
        <button onClick={onLogout} className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-50"><LogOut size={20} /> Keluar</button>
      </div>
    </>
  )
}

function AsatidzAccessGate({ access }: { access: AsatidzAccess }) {
  const copy = access.status === 'PENDING_REVIEW'
    ? {
        title: 'Pendaftaran sedang ditinjau',
        description: 'Data Anda sudah diterima. Admin akan memeriksa profil, keilmuan, dan dokumen sebelum membuka fitur mengajar.',
        action: 'Lihat status pendaftaran',
      }
    : access.status === 'REVISION_REQUIRED' || access.status === 'REJECTED'
      ? {
          title: 'Pendaftaran perlu diperbaiki',
          description: access.reviewNote || 'Buka profil untuk melihat catatan admin, perbarui data, lalu kirim ulang.',
          action: 'Perbaiki pendaftaran',
        }
      : access.status === 'SUSPENDED'
        ? {
            title: 'Akses Asatidz ditangguhkan',
            description: 'Hubungi admin KajianQu untuk klarifikasi. Data dan fitur mengajar tetap terlindungi selama penangguhan.',
            action: 'Lihat profil',
          }
        : {
            title: 'Selesaikan pendaftaran Asatidz',
            description: 'Lengkapi pendidikan, pengalaman, hafalan, rekening, tag keilmuan, serta CV. Setelah itu kirim untuk verifikasi admin.',
            action: 'Lengkapi pendaftaran',
          }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-4xl place-items-center py-8">
      <section className="w-full overflow-hidden rounded-[36px] border border-amber-100 bg-white shadow-xl shadow-emerald-950/5">
        <div className="bg-[#064E3B] p-7 text-white sm:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10"><ShieldAlert size={27} /></span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Akses dashboard terlindungi</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/75 sm:text-base">{copy.description}</p>
        </div>
        <div className="p-6 sm:p-9">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1', 'Lengkapi profil dan dokumen'],
              ['2', 'Admin meninjau data'],
              ['3', 'Fitur mengajar dibuka'],
            ].map(([number, label]) => (
              <div key={number} className="rounded-2xl bg-slate-50 p-4">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800">{number}</span>
                <p className="mt-3 text-sm font-bold text-slate-700">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/asatidz/profile" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 font-black text-white transition hover:bg-[#043f30] sm:w-auto">
            {copy.action} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_PROFILE: 'Profil belum lengkap',
    PENDING_REVIEW: 'Menunggu review',
    REVISION_REQUIRED: 'Perlu revisi',
    APPROVED: 'Terverifikasi',
    REJECTED: 'Perlu perbaikan',
    SUSPENDED: 'Ditangguhkan',
  }
  return labels[status] ?? 'Dalam proses'
}

function SidebarItem({ icon, label, href, active, badge, locked = false, onNavigate }: {
  icon: React.ReactNode
  label: string
  href: string
  active: boolean
  badge?: string
  locked?: boolean
  onNavigate: () => void
}) {
  return (
    <Link href={href} onClick={onNavigate} aria-disabled={locked}>
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${active ? 'bg-[#064E3B] text-white shadow-lg' : locked ? 'text-gray-300 hover:bg-amber-50 hover:text-amber-700' : 'text-gray-400 hover:bg-gray-50 hover:text-emerald-900'}`}>
        <div className="flex items-center gap-4">
          <div className={active ? 'text-emerald-400' : ''}>{icon}</div>
          <span className={`text-sm ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
        </div>
        {locked && <span className="text-[9px] font-black uppercase tracking-wider">Terkunci</span>}
        {badge && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
    </Link>
  )
}
