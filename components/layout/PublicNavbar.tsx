'use client'

// components/layout/PublicNavbar.tsx
// Satu navbar untuk semua halaman PUBLIK
// Kondisional:
//   userProfile = null  → tampilkan tombol "Masuk"
//   userProfile = ada   → tampilkan avatar + nama + dropdown logout

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

export default function PublicNavbar({ userProfile }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const isLoggedIn = !!userProfile

  const [scrolled,     setScrolled]     = useState(false)
  const [fiturOpen,    setFiturOpen]    = useState(false)
  const [donasiOpen,   setDonasiOpen]   = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const firstName = userProfile?.nama?.split(' ')[0] || 'User'
  const initial   = userProfile?.nama?.charAt(0).toUpperCase() || 'U'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/welcome')
    router.refresh()
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#1a7a53] shadow-lg' : 'bg-[#1a7a53]/90 backdrop-blur-md'
    }`}>
      <div className="max-w-[1378px] mx-auto px-6 h-[72px] flex items-center justify-between">

        {/* ── LOGO ── */}
        <Link href="/welcome" className="shrink-0">
          <img src={imgLogo} alt="KajianQu" className="h-11 w-auto object-contain" />
        </Link>

        {/* ── NAV LINKS tengah ── */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/welcome"
            className={`text-sm font-medium transition-colors ${pathname === '/welcome' ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}
          >
            Beranda
          </Link>

          {/* Fitur dropdown */}
          <div className="relative" onMouseEnter={() => setFiturOpen(true)} onMouseLeave={() => setFiturOpen(false)}>
            <button className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#d3ad0f] transition-colors">
              Fitur <ChevronDown size={14} className={`transition-transform ${fiturOpen ? 'rotate-180' : ''}`} />
            </button>
            {fiturOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <Link href={isLoggedIn ? '/quran' : '/welcome'}
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors"
                  onClick={() => setFiturOpen(false)}
                >
                  Sahabat Qur'an
                </Link>
                <Link href={isLoggedIn ? '/materi' : '/welcome'}
                  className="block px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors"
                  onClick={() => setFiturOpen(false)}
                >
                  Keilmuan
                </Link>
              </div>
            )}
          </div>

          <Link href="/kelas"
            className={`text-sm font-medium transition-colors ${pathname.startsWith('/kelas') ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}
          >
            Kelas
          </Link>

          {/* Donasi dropdown */}
          <div className="relative" onMouseEnter={() => setDonasiOpen(true)} onMouseLeave={() => setDonasiOpen(false)}>
            <button className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#d3ad0f] transition-colors">
              Donasi <ChevronDown size={14} className={`transition-transform ${donasiOpen ? 'rotate-180' : ''}`} />
            </button>
            {donasiOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {['Infaq Asatidz', 'Sodaqoh', "Wakaf Al-Qur'an", 'Katalog Produk'].map((item) => (
                  <button key={item}
                    className="w-full text-left block px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors"
                    onClick={() => setDonasiOpen(false)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── KANAN: kondisional ── */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            // ── Sudah login: avatar + nama + dropdown ──
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-all px-3.5 py-2 rounded-full"
              >
                <div className="w-8 h-8 rounded-full bg-[#d3ad0f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                  {userProfile?.foto_url
                    ? <img src={userProfile.foto_url} alt={firstName} className="w-full h-full object-cover" />
                    : <span>{initial}</span>
                  }
                </div>
                <span className="text-white font-semibold text-sm hidden sm:block whitespace-nowrap">{firstName}</span>
                <ChevronDown size={13} className={`text-white/70 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[14px] shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Info user */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-bold text-gray-800 text-sm">{userProfile?.nama}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{userProfile?.role}</p>
                  </div>
                  <Link href="/profil"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} /> Profil Saya
                  </Link>
                  <Link href="/home"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <div className="border-t border-gray-100">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ── Belum login: tombol Masuk ──
            <Link href="/login"
              className="bg-white text-[#15441a] font-semibold text-sm px-5 py-2.5 rounded-[12px] hover:bg-[#d3ad0f] hover:text-white transition-all whitespace-nowrap"
            >
              Masuk
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden text-white p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a7a53] border-t border-white/10 px-6 py-4 space-y-1">
          {[
            { label: 'Beranda', href: '/welcome' },
            { label: 'Kelas',   href: '/kelas' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="block py-2.5 text-white text-sm font-medium hover:text-[#d3ad0f] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 text-sm py-2.5">
              <LogOut size={16} /> Keluar
            </button>
          ) : (
            <Link href="/login" className="block py-2.5 text-[#d3ad0f] text-sm font-bold"
              onClick={() => setMobileOpen(false)}
            >
              Masuk →
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}