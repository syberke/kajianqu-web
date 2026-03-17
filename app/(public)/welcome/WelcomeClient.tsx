'use client'

// app/welcome/WelcomeClient.tsx
// Satu halaman untuk belum login dan sudah login
// Perbedaannya HANYA di navbar:
//   - Belum login → tombol "Masuk"
//   - Sudah login  → avatar + nama + dropdown (Profil, Dashboard, Keluar)

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User, LayoutDashboard, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ── Assets ──────────────────────────────────────────────────────────
const imgLogo          = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgHeroPhone     = "https://www.figma.com/api/mcp/asset/46b95364-6904-4d3c-b808-6d3567daab63"
const imgGooglePlay    = "https://www.figma.com/api/mcp/asset/f43088f3-2402-424b-8ba7-a28d985f7c15"
const imgAppStore      = "https://www.figma.com/api/mcp/asset/c3279e4f-e37a-410b-b3b8-a0916b096877"
const imgUstadz        = "https://www.figma.com/api/mcp/asset/4125f53e-864a-4da0-9c3a-9027e2118d5f"
const imgVideoThumb    = "https://www.figma.com/api/mcp/asset/43e66f15-e177-4989-9e7f-70896d3094ef"
const imgKelas         = "https://www.figma.com/api/mcp/asset/7457a6f1-a3f4-4def-8df5-5b4f83e022ee"
const imgFiturPhone    = "https://www.figma.com/api/mcp/asset/14b1d2e3-cf74-4f7a-9bd5-a4540ad294fe"
const imgDonasi1       = "https://www.figma.com/api/mcp/asset/cb17337a-ad6b-4b73-92cf-fd263ac1ca16"
const imgDonasi2       = "https://www.figma.com/api/mcp/asset/6ed7329d-7948-4c1b-a4cd-29cb3da54b7e"
const imgDonasi3       = "https://www.figma.com/api/mcp/asset/e10a9413-d3a1-4d05-adbf-65fed3a19ca8"
const imgDonasi4       = "https://www.figma.com/api/mcp/asset/64bb3f2f-7e7d-4dff-9242-c2073117017a"
const imgAvatar        = "https://www.figma.com/api/mcp/asset/a88b3c47-6f91-4710-8244-6cef8cb97140"
const imgIconMateri    = "https://www.figma.com/api/mcp/asset/801ca7ec-92f4-4ca9-b481-e9bdea576ef5"
const imgIconAI        = "https://www.figma.com/api/mcp/asset/806cc7b4-2c24-49c2-9cf1-afb66a1fee9f"
const imgIconUstadz    = "https://www.figma.com/api/mcp/asset/d4a097fa-e78c-4cc3-8960-4d431b7db44e"
const imgIconGratis    = "https://www.figma.com/api/mcp/asset/84ca5d09-a253-45b6-aa9a-e885cb262696"
const imgWA            = "https://www.figma.com/api/mcp/asset/76804cd5-fffd-4270-98f8-a1df1731d6ec"
const imgIG            = "https://www.figma.com/api/mcp/asset/312a2fb9-7fe3-4a0f-bcf7-f58d23ebe756"
const imgPlayBtn       = "https://www.figma.com/api/mcp/asset/e489087f-336f-4c4a-8878-21e8a62e70b7"
const imgEAbsensi      = "https://www.figma.com/api/mcp/asset/64bb3f2f-7e7d-4dff-9242-c2073117017a"
const imgCBT           = "https://www.figma.com/api/mcp/asset/e10a9413-d3a1-4d05-adbf-65fed3a19ca8"

// ── Types ────────────────────────────────────────────────────────────
interface UserProfile {
  nama?: string
  email?: string
  foto_url?: string
  role?: string
}

interface Props {
  userProfile: UserProfile | null  // null = belum login
}

// ── PAYMENT & NOMINAL DATA ───────────────────────────────────────────
const NOMINALS = [
  { label: 'Rp 10.000', value: 10000 },
  { label: 'Rp 25.000', value: 25000 },
  { label: 'Rp 30.000', value: 30000 },
  { label: 'Rp 35.000', value: 35000 },
]

const PAYMENT_METHODS = ['Transfer Bank (BCA)', 'Transfer Bank (BNI)', 'Transfer Bank (BRI)', 'Transfer Bank (Mandiri)', 'BSI Mobile', 'GoPay', 'OVO', 'Dana', 'ShopeePay']

// ════════════════════════════════════════════════════════════════════
export default function WelcomeClient({ userProfile }: Props) {
  const router              = useRouter()
  const isLoggedIn          = !!userProfile
  const firstName           = userProfile?.nama?.split(' ')[0] || 'Sahabat'
  const initial             = userProfile?.nama?.charAt(0).toUpperCase() || 'U'

  // Navbar state
  const [scrolled, setScrolled]         = useState(false)
  const [fiturOpen, setFiturOpen]       = useState(false)
  const [donasiOpen, setDonasiOpen]     = useState(false)
  const [profileOpen, setProfileOpen]   = useState(false)
  const profileRef                      = useRef<HTMLDivElement>(null)

  // Donation popup state
  const [showPopup, setShowPopup]       = useState(false)
  const [selectedNominal, setSelected]  = useState<number | null>(null)
  const [isOther, setIsOther]           = useState(false)
  const [customNominal, setCustom]      = useState('')
  const [paymentMethod, setPayment]     = useState('')
  const [paymentOpen, setPaymentOpen]   = useState(false)
  const [donateLoading, setDonateLoad]  = useState(false)
  const [donateSuccess, setDonateOk]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Tutup profile dropdown saat klik luar
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
    router.refresh()
  }

  const handleDonate = async () => {
    const final = isOther ? parseInt(customNominal.replace(/\D/g, '')) : selectedNominal
    if (!final || !paymentMethod) return
    setDonateLoad(true)
    await new Promise(r => setTimeout(r, 1500))
    setDonateOk(true)
    setDonateLoad(false)
  }

  const resetPopup = () => {
    setShowPopup(false)
    setSelected(null)
    setIsOther(false)
    setCustom('')
    setPayment('')
    setDonateOk(false)
  }

  return (
    <div className="bg-[#f8fffe] min-h-screen font-['Poppins',sans-serif] overflow-x-hidden">

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#1a7a53] shadow-lg' : 'bg-[#1a7a53]/80 backdrop-blur-md'
      }`}>
        <div className="max-w-[1378px] mx-auto px-6 h-[80px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/welcome">
            <img src={imgLogo} alt="KajianQu" className="h-12 w-auto object-contain" />
          </Link>

          {/* Nav links tengah */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/welcome" className="text-white font-medium hover:text-[#d3ad0f] transition-colors">Beranda</Link>

            {/* Fitur dropdown */}
            <div className="relative" onMouseEnter={() => setFiturOpen(true)} onMouseLeave={() => setFiturOpen(false)}>
              <button className="flex items-center gap-2 text-white font-medium hover:text-[#d3ad0f] transition-colors">
                Fitur <ChevronDown size={16} className={`transition-transform ${fiturOpen ? 'rotate-180' : ''}`} />
              </button>
              {fiturOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg overflow-hidden">
                  <Link href="/sahabat-quran" className="block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Sahabat Qur'an</Link>
                  <Link href="/keilmuan"      className="block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Keilmuan</Link>
                </div>
              )}
            </div>

            <Link href="/kelas" className="text-white font-medium hover:text-[#d3ad0f] transition-colors">Kelas</Link>

            {/* Donasi dropdown */}
            <div className="relative" onMouseEnter={() => setDonasiOpen(true)} onMouseLeave={() => setDonasiOpen(false)}>
              <button className="flex items-center gap-2 text-white font-medium hover:text-[#d3ad0f] transition-colors">
                Donasi <ChevronDown size={16} className={`transition-transform ${donasiOpen ? 'rotate-180' : ''}`} />
              </button>
              {donasiOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg overflow-hidden">
                  <button onClick={() => { setShowPopup(true); setDonasiOpen(false) }} className="w-full text-left block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Infaq Asatidz</button>
                  <button onClick={() => { setShowPopup(true); setDonasiOpen(false) }} className="w-full text-left block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Sodaqoh</button>
                  <button onClick={() => { setShowPopup(true); setDonasiOpen(false) }} className="w-full text-left block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Wakaf Al-Qur'an</button>
                  <Link href="/katalog" className="block px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Katalog Produk</Link>
                </div>
              )}
            </div>
          </div>

          {/* ── KANAN NAVBAR: kondisional ── */}
          {isLoggedIn ? (
            // ── Sudah login: avatar + nama + dropdown ──
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all px-4 py-2 rounded-full"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#d3ad0f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                  {userProfile?.foto_url
                    ? <img src={userProfile.foto_url} alt={firstName} className="w-full h-full object-cover" />
                    : <span>{initial}</span>
                  }
                </div>
                <span className="text-white font-semibold text-sm hidden sm:block whitespace-nowrap">{firstName}</span>
                <ChevronDown size={14} className={`text-white transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown profile */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[14px] shadow-xl overflow-hidden border border-gray-100 z-50">
                  {/* Info user */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">{userProfile?.nama}</p>
                    <p className="text-xs text-gray-400 capitalize">{userProfile?.role || 'siswa'}</p>
                  </div>
                  <Link href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User size={16} /> Profil Saya
                  </Link>
                  <Link href="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1a7a53] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
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
            <Link href="/login" className="bg-white text-[#15441a] font-semibold px-6 py-2.5 rounded-[15px] hover:bg-[#d3ad0f] hover:text-white transition-all">
              Masuk
            </Link>
          )}
        </div>
      </nav>

      <section className="relative min-h-screen bg-gradient-to-b from-[#1a7a53] to-[#096942] overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-800 to-transparent" />
        </div>
        <div className="max-w-[1378px] mx-auto px-6 pt-24 pb-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-[#d3ad0f] font-semibold text-lg">KajianQu</p>
              {isLoggedIn ? (
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Ahlan wa Sahlan,<br/>
                  <span className="text-emerald-200">{firstName}! 👋</span>
                </h1>
              ) : (
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Dekat dengan Al-Qur'an,<br/>
                  <span className="text-emerald-200">Tenang di Hati</span>
                </h1>
              )}
              <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                {isLoggedIn
                  ? 'Semoga hari ini penuh keberkahan. Lanjutkan perjalanan belajarmu bersama KajianQu.'
                  : "KajianQU adalah web islami yang membantu kamu lebih dekat dengan Al-Qur'an. Mulai dari membaca, doa, jadwal ibadah, hingga belajar Islam dengan mudah dalam satu tempat."}
              </p>
            </div>

            {isLoggedIn ? (
              <div className="flex flex-wrap gap-4">
                <Link href="/sahabat-quran" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                  Mulai Ngaji
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <img src={imgGooglePlay} alt="Google Play" className="h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
                <img src={imgAppStore}   alt="App Store"   className="h-14 object-contain cursor-pointer hover:opacity-80 transition-opacity rounded-lg" />
              </div>
            )}
          </div>
          <div className="relative flex justify-center">
            <img src={imgHeroPhone} alt="App Preview" className="h-[560px] object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1378px] mx-auto">
        <h2 className="text-[#1a7a53] text-4xl font-bold text-center mb-16">Sekapur Sirih</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Ust. Adi Hidayat', 'Ust. Abdul Somad', 'Ust. Hanan Attaki'].map((name, i) => (
            <div key={i} className="relative rounded-[25px] overflow-hidden h-[400px] shadow-xl group cursor-pointer">
              <img src={imgUstadz} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a7a53] via-transparent to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-14 backdrop-blur-sm bg-white/10 border-2 border-white rounded-[19px] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src={imgPlayBtn} alt="Play" className="w-5 h-5 object-contain" />
                </div>
              </div>
              <p className="absolute bottom-6 left-6 text-white font-semibold text-lg">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1378px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Mengapa <span className="text-[#1a7a53]">KajianQu?</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: imgIconMateri, title: "Materi Lengkap",     desc: "Mulai dari pengenalan huruf hingga pendalaman tajwid tersedia disini." },
              { icon: imgIconAI,     title: "Koreksi AI",         desc: "Teknologi AI mengoreksi bacaan kamu secara real-time dan akurat." },
              { icon: imgIconUstadz, title: "Ustadz Profesional", desc: "Belajar bersama ustadz berpengalaman dan bersertifikat." },
              { icon: imgIconGratis, title: "Gratis",             desc: "Akses seluruh fitur dasar tanpa biaya apapun." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <img src={item.icon} alt={item.title} className="w-10 h-10 object-contain" />
                </div>
                <h3 className="font-semibold text-xl text-black">{item.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1378px] mx-auto">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block border border-[#d3ad0f] text-[#d3ad0f] font-bold px-6 py-2 rounded-full">Fitur Unggulan</div>
          <h2 className="text-4xl font-semibold text-black max-w-3xl mx-auto leading-tight">
            Koreksi Bacaan KajianQU Kamu dengan Teknologi <span className="text-[#1a7a53]">Artificial Intelligence</span>
          </h2>
        </div>
        <div className="relative rounded-[25px] overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl group cursor-pointer">
          <img src={imgVideoThumb} alt="Demo AI" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
              <img src={imgPlayBtn} alt="Play" className="w-10 h-10 object-contain ml-1" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 overflow-hidden">
        <h2 className="text-[#1a7a53] text-4xl font-bold text-center mb-16">Fitur-fitur Lain</h2>
        <div className="flex gap-6 px-8 overflow-x-auto pb-4 scrollbar-hide justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`relative rounded-[20px] overflow-hidden shadow-[0px_1px_25px_0px_rgba(26,122,83,0.4)] flex-shrink-0 cursor-pointer hover:scale-105 transition-transform ${i === 2 ? 'w-[280px] h-[370px]' : 'w-[240px] h-[320px]'}`}>
              <img src={imgFiturPhone} alt={`Fitur ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <h3 className="text-2xl font-bold text-black">Sahabat Qur'an</h3>
          <p className="text-gray-500 mt-1">Lengkap dengan koreksi AI</p>
        </div>
      </section>

      <section className="relative bg-gradient-to-r from-[#025a36] to-[#0f6f48] py-20 px-6 overflow-hidden">
        <div className="max-w-[1378px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 relative z-10">
            <h2 className="text-5xl font-bold text-white leading-tight">Ikuti Kelas<br/>unggulan kami</h2>
            <p className="text-white/80 text-lg">Join KajianQu dan kuasai ilmu agama dengan mudah, menyenangkan, dan percaya diri kapanpun dan dimanapun.</p>
            <Link href="/kelas" className="inline-block bg-white text-[#1a7a53] font-semibold px-8 py-3 rounded-[15px] hover:bg-[#d3ad0f] hover:text-white transition-all">
              Ikuti Kelas
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-[25px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-40">
                  <img src={imgKelas} alt="Kelas" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-3 bg-white text-[#1a7a53] text-xs font-semibold px-3 py-1 rounded-full">Ust. Adi Hidayat</div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-gray-800">Hukumnya Tahlilan</h4>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-xs text-gray-500">Live Stream</span></div>
                  <p className="text-sm text-gray-500">Membahas Seputar Tahlilan, dan pertan...</p>
                  <Link href="/kelas" className="text-[#1a7a53] font-semibold text-sm">Ikuti Kelas →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-[1378px] mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-[#1a7a53] text-4xl font-bold">Berbagai Pilihan Kebaikan</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Setiap kebaikan adalah ladang pahala. Pilih program yang ingin kamu dukung dan mari bersama menebar keberkahan.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { img: imgDonasi1, title: "Wakaf Al-Qur'an", desc: "Wakaf akan di belikan Al-Qu'an" },
            { img: imgDonasi2, title: "Sodaqoh",          desc: "Sodaqoh yang akan dikelola" },
            { img: imgDonasi3, title: "Infaq Asatidz",    desc: "Diberikan kepada Ustadz-ustadz" },
            { img: imgDonasi4, title: "Katalog Produk",   desc: "Produk dari hasil sodaqoh" },
          ].map((item, i) => (
            <button key={i} onClick={() => setShowPopup(true)}
              className="bg-white rounded-[20px] shadow-[0px_0px_10px_0px_rgba(34,95,93,0.3)] overflow-hidden hover:shadow-xl transition-shadow group text-left w-full"
            >
              <div className="relative h-[200px]">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(1,71,9,0.65)] to-[#1a7a53]" />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-[#1a7a53] font-bold text-lg">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
                <p className="text-[#1a7a53] font-semibold text-sm opacity-70">Donasi disini →</p>
              </div>
            </button>
          ))}
        </div>
      </section>

    
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1378px] mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[#1a7a53] text-4xl font-bold">Apa Kata Mereka</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Pengalaman nyata dari para pengguna yang telah merasakan manfaat aplikasi ini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ahmad Dahlan S.aG", role: "Kepala SMK TI BAZMA" },
              { name: "Ust. Adi Hidayat",  role: "Ustadz Terkenal" },
              { name: "Ust. Adi Hidayat",  role: "Ustadz Terkenal" },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-[#eaecf0] rounded-[12px] shadow-[0px_1px_10px_0px_rgba(26,122,83,0.3)] p-6 space-y-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <img src={imgAvatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[#1d2939]">{t.name}</p>
                    <p className="text-[#667085] text-sm">{t.role}</p>
                  </div>
                </div>
                <p className="text-[#667085] leading-relaxed text-justify">
                  Aplikasi ini bukan cuma sekadar platform islami biasa. Dari sisi desain dan pengalaman pengguna, semuanya terasa matang dan terstruktur. Navigasinya jelas, fiturnya lengkap, dan mudah dipakai oleh semua kalangan.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-[#1a7a53] to-[#008750] py-24 px-6 overflow-hidden">
        <div className="max-w-[1378px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white leading-tight">Siap mendalami<br/>ilmu Alquran &amp; Akhlaq?</h2>
              <p className="text-white/80 text-lg">Bergabunglah bersama kami untuk mempelajari ilmu agama secara mendalam, terstruktur, dan relevan dengan kehidupan masa kini.</p>
            </div>
            <div className="space-y-4">
              <div><p className="text-white font-bold text-3xl">+18 M</p><p className="text-white/70">Pengguna</p></div>
              <div className="flex flex-wrap gap-4">
                <img src={imgGooglePlay} alt="Google Play" className="h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
                <img src={imgAppStore}   alt="App Store"   className="h-14 object-contain cursor-pointer hover:opacity-80 transition-opacity rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex justify-center relative z-10">
            <img src={imgHeroPhone} alt="App Preview" className="h-[400px] object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>

      
      <footer className="border-t-2 border-[#1a7a53] py-16 px-6">
        <div className="max-w-[1378px] mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-sm space-y-4">
            <img src={imgLogo} alt="KajianQu" className="h-14 object-contain" />
            <p className="text-gray-600">QuranKu adalah platform islami untuk membaca Al-Qur'an, doa, dan belajar Islam dengan mudah dan nyaman.</p>
            <div className="flex gap-4">
              <img src={imgWA} alt="WhatsApp" className="w-9 h-9 object-contain cursor-pointer hover:opacity-70 transition-opacity" />
              <img src={imgIG} alt="Instagram" className="w-9 h-9 object-contain cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
          </div>
          <div className="flex gap-16 flex-wrap">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Tentang Kami</h4>
              {['Sekilas QuranKu', 'Visi Misi', 'Ustadz'].map(l => (
                <p key={l} className="text-gray-500 hover:text-[#1a7a53] cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Kelas</h4>
              {['Fiqih', 'Akhlak', 'Tahfidz', 'Akidah', 'Tafsir'].map(l => (
                <p key={l} className="text-gray-500 hover:text-[#1a7a53] cursor-pointer transition-colors">{l}</p>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Waktu Sholat</h4>
            </div>
          </div>
        </div>
        <div className="max-w-[1378px] mx-auto mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-400 text-sm">© {new Date().getFullYear()} KajianQu. All rights reserved.</p>
        </div>
      </footer>

      
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-[700px] overflow-hidden shadow-2xl">

            {/* Header bar abu */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-b border-gray-200">
              <span className="text-sm text-gray-500 font-medium">PopUp - Log Out</span>
              <button onClick={resetPopup} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {donateSuccess ? (
              <div className="p-10 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="text-2xl font-bold text-[#1a7a53]">Terima Kasih!</h3>
                <p className="text-gray-500">Donasi berhasil dikirim. Jazakumullahu khairan!</p>
                <button onClick={resetPopup} className="mt-4 px-8 py-3 bg-[#1a7a53] text-white rounded-xl hover:bg-[#15613f] transition-colors font-semibold">
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4 text-center">
                  <h2 className="text-xl font-bold text-gray-800">Yuk, Bantu support untuk program kebaikan KajianQu</h2>
                </div>

                <div className="px-6 pb-4 grid grid-cols-2 gap-5">
                  {/* KIRI: form donasi */}
                  <div className="space-y-4">
                    <p className="text-[#1a7a53] font-semibold text-sm">Pilih Nominal</p>

                    <div className="grid grid-cols-3 gap-2">
                      {NOMINALS.map((n) => (
                        <button key={n.value} onClick={() => { setSelected(n.value); setIsOther(false); setCustom('') }}
                          className={`py-2 px-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedNominal === n.value && !isOther
                              ? 'border-[#1a7a53] bg-[#1a7a53] text-white'
                              : 'border-gray-200 text-gray-600 hover:border-[#1a7a53]'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                      <button onClick={() => { setIsOther(true); setSelected(null) }}
                        className={`py-2 px-2 rounded-lg border text-sm font-medium transition-all ${
                          isOther ? 'border-[#1a7a53] bg-[#1a7a53] text-white' : 'border-gray-200 text-gray-600 hover:border-[#1a7a53]'
                        }`}
                      >
                        Nominal lainnya
                      </button>
                    </div>

                    <div className={`flex items-center border rounded-xl px-4 h-12 gap-2 transition-all ${isOther ? 'border-[#1a7a53]' : 'border-gray-200 bg-gray-50'}`}>
                      <span className="text-[#1a7a53] font-bold text-sm">Rp</span>
                      <input
                        type="text" placeholder="Masukkan Nominal" disabled={!isOther}
                        value={isOther ? customNominal : selectedNominal ? selectedNominal.toLocaleString('id-ID') : ''}
                        onChange={e => setCustom(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>

                    {/* Metode pembayaran */}
                    <div className="relative">
                      <button onClick={() => setPaymentOpen(!paymentOpen)}
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 h-12 text-sm hover:border-[#1a7a53] transition-colors bg-white"
                      >
                        <span className={paymentMethod ? 'text-gray-700' : 'text-gray-400'}>{paymentMethod || 'Metode Pembayaran'}</span>
                        <ChevronDown size={16} className={`transition-transform ${paymentOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {paymentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                          {PAYMENT_METHODS.map((m) => (
                            <button key={m} onClick={() => { setPayment(m); setPaymentOpen(false) }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed">Terimakasih atas kontribusi supportnya untuk program kebaikan KajianQu</p>

                    <button onClick={handleDonate}
                      disabled={donateLoading || (!selectedNominal && !customNominal) || !paymentMethod}
                      className="w-full h-12 bg-[#1a7a53] text-white rounded-xl font-semibold text-base hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {donateLoading ? 'Memproses...' : 'Donasi Sekarang'}
                    </button>
                  </div>

                  {/* KANAN: program cards */}
                  <div className="space-y-3">
                    <p className="text-gray-700 font-semibold text-sm">Program Buatan kami</p>

                    {/* E-Absensi */}
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <div className="relative h-28 bg-gradient-to-r from-blue-500 to-blue-600">
                        <img src={imgEAbsensi} alt="E-Absensi" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 p-3 flex flex-col justify-between">
                          <div className="flex flex-col items-end gap-1">
                            {['Pelacakan Real-time', 'Laporan Otomatis', 'Integrasi Mudah'].map(f => (
                              <span key={f} className="bg-white/90 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full">✓ {f}</span>
                            ))}
                          </div>
                          <p className="text-white font-bold text-sm drop-shadow">Absensi Jadi Mudah!</p>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="font-semibold text-gray-800 text-sm">E-Absensi</p>
                        <p className="text-gray-400 text-xs mt-0.5">Sistem digital buat mencatat kehadiran secara otomatis (online).</p>
                      </div>
                    </div>

                    {/* CBT */}
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <div className="relative h-28 bg-gradient-to-r from-emerald-500 to-teal-600">
                        <img src={imgCBT} alt="CBT" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 p-3 flex flex-col justify-between">
                          <div className="flex flex-col items-end gap-1">
                            {['Sistem Anti-Curang', 'Penilaian Otomatis', 'Analytic Hasil Studi'].map(f => (
                              <span key={f} className="bg-white/90 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">✓ {f}</span>
                            ))}
                          </div>
                          <p className="text-white font-bold text-sm drop-shadow">Ujian Online terpercaya</p>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="font-semibold text-gray-800 text-sm">CBT (Computer Based Test)</p>
                        <p className="text-gray-400 text-xs mt-0.5">Sistem ujian berbasis komputer yang memungkinkan peserta mengerjakan soal secara digital.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer popup */}
                <div className="grid grid-cols-2 gap-3 px-6 pb-5">
                  <button onClick={resetPopup} className="h-12 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                  <button onClick={handleLogout} className="h-12 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
                    keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}