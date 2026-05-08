'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu, X, ChevronDown, UserCircle, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const imgLogo = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"

export default function Navbar({ userProfile }: { userProfile: any }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [profileOpen, setProfileOpen]   = useState(false)

  const navLinks = [
    { name: 'Beranda',  href: '/welcome' },
    { name: 'Fitur',    dropdown: [
      { name: 'Sahabat Quran', href: '/quran' },
      { name: 'Keilmuan',     href: '/keilmuan' },
    ]},
    { name: 'Kelas',    href: '/kelas' },
    { name: 'Donasi',   dropdown: [
      { name: 'Wakaf Al-Quran',  href: '/donasi/wakaf-quran' },
      { name: 'Sodaqoh Jariyah', href: '/donasi/sodaqoh' },
      { name: 'Infaq Asatidz',   href: '/donasi/infaq-asatidz' },
      { name: 'Katalog Produk',  href: '/donasi/katalog-produk' },
    ]},
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/welcome')
    router.refresh()
  }

  const firstName = userProfile?.nama?.split(' ')[0] || 'User'
  const initial   = userProfile?.nama?.charAt(0)?.toUpperCase() || 'U'

  return (
    <nav className="sticky top-0 z-50 bg-[#157a52] shadow-sm">
      <div className="max-w-[1378px] mx-auto px-6 h-[72px] flex items-center justify-between">

        {/* LOGO */}
        <Link href="/welcome">
          <img src={imgLogo} alt="KajianQu" className="h-12 md:h-14 w-auto object-contain" />
        </Link>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <div key={link.name} className="relative group"
              onMouseEnter={() => link.dropdown && setOpenDropdown(link.name)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {link.dropdown ? (
                <>
                  <button className="flex items-center gap-1 text-sm font-medium text-white hover:text-[#d3ad0f] transition-colors py-2">
                    {link.name} <ChevronDown size={14} className={`transition-transform ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === link.name && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 z-50">
                      {link.dropdown.map(sub => (
                        <Link key={sub.href} href={sub.href}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#157a52] font-medium transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={link.href!}
                  className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-[#d3ad0f]' : 'text-white hover:text-[#d3ad0f]'}`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: PROFILE */}
        <div className="flex items-center gap-3">
          <button className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all hidden sm:flex">
            <Search size={20} />
          </button>
          <button className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#157a52]" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-all px-3 py-2 rounded-full"
            >
              <div className="w-8 h-8 rounded-full bg-[#d3ad0f] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {userProfile?.foto_url
                  ? <img src={userProfile.foto_url} alt={firstName} className="w-full h-full object-cover" />
                  : <span>{initial}</span>
                }
              </div>
              <span className="text-white text-sm font-semibold hidden sm:block">{firstName}</span>
              <ChevronDown size={13} className={`text-white/70 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[14px] shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="font-bold text-gray-800 text-sm">{userProfile?.nama}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{userProfile?.role || 'Siswa'}</p>
                </div>
                <Link href="/dashboard/siswa/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#157a52] transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserCircle size={16} /> Profil Saya
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

          {/* Mobile Hamburger */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#157a52] border-t border-white/10 px-6 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {navLinks.map(link => (
            <div key={link.name}>
              {link.dropdown ? (
                <>
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider py-2">{link.name}</p>
                  {link.dropdown.map(sub => (
                    <Link key={sub.href} href={sub.href}
                      className="block py-2 pl-4 text-white text-sm font-medium hover:text-[#d3ad0f]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </>
              ) : (
                <Link href={link.href!}
                  className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          <div className="border-t border-white/10 pt-4">
            <Link href="/dashboard/siswa/profile"
              className="block py-2 text-white text-sm font-medium hover:text-[#d3ad0f]"
              onClick={() => setMobileOpen(false)}
            >
              👤 Profil Saya
            </Link>
            <button onClick={handleLogout} className="block py-2 text-red-300 text-sm font-bold">
              Keluar
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}