'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const imgLogo = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"

const navLinks = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Fitur',
    dropdown: [
      { label: "Sahabat Qur'an", href: '/sahabat-quran' },
      { label: 'Keilmuan', href: '/keilmuan' },
    ],
  },
  { label: 'Kelas', href: '/kelas' },
  {
    label: 'Donasi',
    dropdown: [
      { label: 'Infaq Asatidz', href: '/donation' },
      { label: 'Sodaqoh', href: '/donation' },
      { label: "Wakaf Al-Qur'an", href: '/donation' },
      { label: 'Katalog Produk', href: '/katalog' },
    ],
  },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#1a7a53] shadow-lg' : 'bg-[#1a7a53]/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-[1378px] mx-auto px-6 h-[80px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img
            src={imgLogo}
            alt="KajianQu"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-2 text-white font-['Poppins',sans-serif] text-base font-medium hover:text-[#d3ad0f] transition-colors py-2">
                  {link.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openDropdown === link.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 min-w-[220px] bg-white rounded-[10px] shadow-[0px_1px_7px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                    {link.dropdown.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        className="block px-[30px] py-[12px] font-['Poppins',sans-serif] text-base text-black hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href!}
                className={`font-['Poppins',sans-serif] text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-[#d3ad0f]'
                    : 'text-white hover:text-[#d3ad0f]'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="bg-white text-[#15441a] font-['Poppins',sans-serif] font-semibold text-base px-6 py-2.5 rounded-[15px] hover:bg-[#d3ad0f] hover:text-white transition-all whitespace-nowrap"
          >
            Masuk
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a7a53] border-t border-white/20 px-6 py-4 space-y-2">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label}>
                <p className="text-white/60 font-['Poppins',sans-serif] text-sm font-semibold uppercase tracking-widest py-2">
                  {link.label}
                </p>
                {link.dropdown.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="block pl-4 py-2 text-white font-['Poppins',sans-serif] hover:text-[#d3ad0f] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href!}
                className="block py-2 text-white font-['Poppins',sans-serif] hover:text-[#d3ad0f] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}