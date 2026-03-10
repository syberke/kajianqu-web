'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Menu, ChevronDown, UserCircle } from 'lucide-react'

export default function Navbar({ userProfile }: { userProfile: any }) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const navLinks = [
    { name: 'Home', href: '/dashboard/siswa' },
    { 
      name: 'Fitur', 
      dropdown: [
        { name: 'Sahabat Quran', href: '/dashboard/siswa/sahabat-quran' },
        { name: 'Keilmuan', href: '/dashboard/siswa/keilmuan' }
      ] 
    },
    { name: 'Kelas', href: '/dashboard/siswa/kelas' },
    { 
      name: 'Donasi', 
      dropdown: [
        { name: 'Katalog Product', href: '/dashboard/siswa/katalog' },
        { name: 'Infaq', href: '/dashboard/siswa/donation' }
      ]
    },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/dashboard/siswa" className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png" 
                alt="KajianQu Logo" 
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER: NAV LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => link.dropdown && setOpenDropdown(link.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.dropdown ? (
                  <button className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-[#064E3B] transition-colors py-2">
                    {link.name}
                    <ChevronDown size={14} className={`transition-transform ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    href={link.href!}
                    className={`text-sm font-bold transition-colors ${
                      pathname === link.href 
                        ? 'text-[#064E3B] border-b-2 border-[#064E3B] pb-1' 
                        : 'text-gray-400 hover:text-[#064E3B]'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {link.dropdown && openDropdown === link.name && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {link.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#064E3B] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: SEARCH, NOTIF, & PROFILE */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all hidden sm:block">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* USER PROFILE - Diarahkan ke dashboard/siswa/profile */}
            <Link 
              href="/dashboard/siswa/profile" 
              className="flex items-center gap-3 pl-4 border-l border-gray-100 group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-[#064E3B] transition-colors">
                  {userProfile?.nama?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[10px] text-gray-400 font-medium capitalize">
                  {userProfile?.role || 'Siswa'}
                </p>
              </div>
              
              {/* Avatar dengan inisial atau fallback icon */}
              <div className="w-10 h-10 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white group-hover:scale-105 group-hover:shadow-emerald-900/20 transition-all overflow-hidden">
                {userProfile?.foto_url ? (
                  <img src={userProfile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userProfile?.nama ? userProfile.nama.substring(0, 1).toUpperCase() : <UserCircle size={20} />
                )}
              </div>
            </Link>

            {/* Mobile Menu Icon */}
            <button className="md:hidden p-2 text-gray-400">
              <Menu size={24} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}