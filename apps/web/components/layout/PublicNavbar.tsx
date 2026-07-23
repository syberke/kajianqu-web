'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const imgLogo = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"

interface UserProfile {
  nama?: string
  email?: string
  foto_url?: string
  role?: string
}

interface Props {
  userProfile?: UserProfile | null
}

function getDashboardHref(role?: string) {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'asatidz') return '/dashboard/asatidz'
  return '/dashboard/siswa'
}

function getProfileHref(role?: string) {
  if (role === 'admin') return '/dashboard/admin/settings'
  if (role === 'asatidz') return '/dashboard/asatidz/profile'
  return '/dashboard/siswa/profile'
}

export default function PublicNavbar({ userProfile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoggedIn = !!userProfile

  const [scrolled, setScrolled] = useState(false)
  const [fiturOpen, setFiturOpen] = useState(false)
  const [donasiOpen, setDonasiOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const desktopMenusRef = useRef<HTMLDivElement>(null)
  const fiturCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const donasiCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const firstName = userProfile?.nama?.split(' ')[0] || 'User'
  const initial = userProfile?.nama?.charAt(0).toUpperCase() || 'U'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => {
    if (fiturCloseTimer.current) clearTimeout(fiturCloseTimer.current)
    if (donasiCloseTimer.current) clearTimeout(donasiCloseTimer.current)
  }, [])

  const openFitur = () => {
    if (fiturCloseTimer.current) clearTimeout(fiturCloseTimer.current)
    if (donasiCloseTimer.current) clearTimeout(donasiCloseTimer.current)
    setDonasiOpen(false)
    setFiturOpen(true)
  }

  const closeFitur = () => {
    fiturCloseTimer.current = setTimeout(() => setFiturOpen(false), 180)
  }

  const openDonasi = () => {
    if (donasiCloseTimer.current) clearTimeout(donasiCloseTimer.current)
    if (fiturCloseTimer.current) clearTimeout(fiturCloseTimer.current)
    setFiturOpen(false)
    setDonasiOpen(true)
  }

  const closeDonasi = () => {
    donasiCloseTimer.current = setTimeout(() => setDonasiOpen(false), 180)
  }

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (desktopMenusRef.current && !desktopMenusRef.current.contains(event.target as Node)) {
        setFiturOpen(false)
        setDonasiOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiturOpen(false)
        setDonasiOpen(false)
        setProfileOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/welcome')
    router.refresh()
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#1a7a53] shadow-lg' : 'bg-[#1a7a53]/90 backdrop-blur-md'}`}>
      <div className="max-w-[1378px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/welcome" className="shrink-0 flex items-center">
          <img src={imgLogo} alt="KajianQu" className="h-12 md:h-14 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>

        <div ref={desktopMenusRef} className="hidden md:flex items-center gap-8">
          <Link href="/welcome" className={`text-sm font-medium transition-colors ${pathname === '/welcome' ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}>
            Beranda
          </Link>

          <div className="relative" onMouseEnter={openFitur} onMouseLeave={closeFitur}>
            <button type="button" aria-haspopup="menu" aria-expanded={fiturOpen} onClick={() => setFiturOpen((open) => !open)} className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#d3ad0f] transition-colors">
              Fitur <ChevronDown size={14} className={`transition-transform ${fiturOpen ? 'rotate-180' : ''}`} />
            </button>
            {fiturOpen && (
              <div className="absolute top-full left-0 z-50 w-72 pt-2" role="menu">
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                  {[
                    { label: "Sahabat Qur'an", href: '/sahabat-quran' },
                    { label: 'Quran AI', href: '/quran-ai' },
                    { label: 'Keilmuan', href: '/keilmuan' },
                    { label: "Do'a Harian", href: '/doa' },
                    { label: 'Dzikir', href: '/dzikir' },
                    { label: 'Kiblat', href: '/kiblat' },
                    { label: 'Live', href: '/live' },
                    { label: 'Bahtsul Masail', href: '/bahtsul-masail' },
                    { label: 'Muamalat', href: '/muamalat' },
                    { label: 'Quote', href: '/quote' },
                    { label: 'Kilas Balik', href: '/kilasbalik' },
                  ].map((item) => (
                    <Link key={item.href} role="menuitem" href={item.href} className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-[#1a7a53]" onClick={() => setFiturOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/kelas" className={`text-sm font-medium transition-colors ${pathname.startsWith('/kelas') ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}>
            Kelas
          </Link>

          <Link href="/ustadz" className={`text-sm font-medium transition-colors ${pathname.startsWith('/ustadz') ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}>
            Ustadz
          </Link>

          <div className="relative" onMouseEnter={openDonasi} onMouseLeave={closeDonasi}>
            <button type="button" aria-haspopup="menu" aria-expanded={donasiOpen} onClick={() => setDonasiOpen((open) => !open)} className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#d3ad0f] transition-colors">
              Donasi <ChevronDown size={14} className={`transition-transform ${donasiOpen ? 'rotate-180' : ''}`} />
            </button>
            {donasiOpen && (
              <div className="absolute top-full left-0 z-50 w-52 pt-2" role="menu">
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  {[
                    { label: "Wakaf Al-Qur'an", href: '/donasi/wakaf-quran' },
                    { label: 'Sodaqoh Jariyah', href: '/donasi/sodaqoh' },
                    { label: 'Infaq Asatidz', href: '/donasi/infaq-asatidz' },
                    { label: 'Katalog Produk', href: '/donasi/katalog-produk' },
                  ].map((item) => (
                    <Link role="menuitem" key={item.href} href={item.href} className="block px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors" onClick={() => setDonasiOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button type="button" aria-expanded={profileOpen} aria-label="Buka menu profil" onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-all px-3.5 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-[#d3ad0f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                  {userProfile?.foto_url ? <img src={userProfile.foto_url} alt={firstName} className="w-full h-full object-cover" /> : <span>{initial}</span>}
                </div>
                <span className="text-white font-semibold text-sm hidden sm:block whitespace-nowrap">{firstName}</span>
                <ChevronDown size={13} className={`text-white/70 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[14px] shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-bold text-gray-800 text-sm">{userProfile?.nama}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{userProfile?.role}</p>
                  </div>
                  <Link href={getProfileHref(userProfile?.role)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors" onClick={() => setProfileOpen(false)}>
                    <User size={16} /> Profil Saya
                  </Link>
                  <Link href={getDashboardHref(userProfile?.role)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors" onClick={() => setProfileOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <div className="border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-white text-[#15441a] font-semibold text-sm px-5 py-2.5 rounded-[12px] hover:bg-[#d3ad0f] hover:text-white transition-all whitespace-nowrap hidden md:block">
              Masuk
            </Link>
          )}

          <button type="button" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'} className="md:hidden text-white p-1.5 ml-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#1a7a53] border-t border-white/10 px-6 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1 pb-2 border-b border-white/10">
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">Menu Utama</p>
            <Link href="/welcome" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Beranda</Link>
            <Link href="/kelas" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Kelas</Link>
            <Link href="/ustadz" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Ustadz</Link>
          </div>
          <div className="space-y-1 py-2 border-b border-white/10">
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">Fitur</p>
            {[
              { label: "Sahabat Qur'an", href: '/sahabat-quran' },
              { label: 'Quran AI', href: '/quran-ai' },
              { label: 'Keilmuan', href: '/keilmuan' },
              { label: "Do'a Harian", href: '/doa' },
              { label: 'Dzikir', href: '/dzikir' },
              { label: 'Kiblat', href: '/kiblat' },
              { label: 'Live', href: '/live' },
              { label: 'Bahtsul Masail', href: '/bahtsul-masail' },
              { label: 'Muamalat', href: '/muamalat' },
              { label: 'Quote', href: '/quote' },
              { label: 'Kilas Balik', href: '/kilasbalik' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>{item.label}</Link>
            ))}
          </div>
          <div className="space-y-1 py-2 border-b border-white/10">
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">Donasi</p>
            <Link href="/donasi/wakaf-quran" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Wakaf Al-Qur&apos;an</Link>
            <Link href="/donasi/sodaqoh" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Sodaqoh Jariyah</Link>
            <Link href="/donasi/infaq-asatidz" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Infaq Asatidz</Link>
            <Link href="/donasi/katalog-produk" className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]" onClick={() => setMobileOpen(false)}>Katalog Produk</Link>
          </div>
          <div className="pt-2">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 text-sm py-2.5 font-bold">
                <LogOut size={16} /> Keluar
              </button>
            ) : (
              <Link href="/login" className="block py-3 mt-2 bg-white text-[#1a7a53] text-center rounded-xl text-sm font-bold" onClick={() => setMobileOpen(false)}>
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
