'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, User, LayoutDashboard, X, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ── Assets (Link Permanen) ──────────────────────────────────────────
const imgLogoWhite = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgLogoColor = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgHeroPhone = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800"
const imgGooglePlay = "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
const imgAppStore = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
const imgUstadz1 = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500"
const imgUstadz2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500"
const imgUstadz3 = "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=500"
const imgVideoThumb = "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=1000"
const imgKelasBlue = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=500"
const imgFiturPhone = "https://images.unsplash.com/photo-1526045612254-ce72c10204cb?auto=format&fit=crop&q=80&w=400"
const imgDonasi1 = "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400"
const imgDonasi2 = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&q=80&w=400"
const imgDonasi3 = "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=400"
const imgDonasi4 = "https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80&w=400"
const imgAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
const imgIconMateri = "https://cdn-icons-png.flaticon.com/512/3389/3389081.png"
const imgIconAI = "https://cdn-icons-png.flaticon.com/512/2082/2082110.png"
const imgIconUstadz = "https://cdn-icons-png.flaticon.com/512/1945/1945648.png"
const imgIconGratis = "https://cdn-icons-png.flaticon.com/512/1162/1162499.png"
const imgWA = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
const imgIG = "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
const imgEAbsensi = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
const imgCBT = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"

// ── Types ────────────────────────────────────────────────────────────
interface UserProfile {
  nama?: string
  email?: string
  foto_url?: string
  role?: string
}

interface Props {
  userProfile: UserProfile | null
}

const NOMINALS = [
  { label: 'Rp 10.000', value: 10000 },
  { label: 'Rp 25.000', value: 25000 },
  { label: 'Rp 30.000', value: 30000 },
  { label: 'Rp 35.000', value: 35000 },
]

const PAYMENT_METHODS = ['Transfer Bank (BCA)', 'Transfer Bank (BNI)', 'Transfer Bank (BRI)', 'Transfer Bank (Mandiri)', 'BSI Mobile', 'GoPay', 'OVO', 'Dana', 'ShopeePay']

export default function WelcomeClient({ userProfile }: Props) {
  const router = useRouter()
  const isLoggedIn = !!userProfile
  const firstName = userProfile?.nama?.split(' ')[0] || 'Sahabat'
  const initial = userProfile?.nama?.charAt(0).toUpperCase() || 'U'

  const [scrolled, setScrolled] = useState(false)
  const [fiturOpen, setFiturOpen] = useState(false)
  const [donasiOpen, setDonasiOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const desktopMenusRef = useRef<HTMLDivElement>(null)
  const fiturCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const donasiCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showPopup, setShowPopup] = useState(false)
  const [selectedNominal, setSelected] = useState<number | null>(null)
  const [isOther, setIsOther] = useState(false)
  const [customNominal, setCustom] = useState('')
  const [paymentMethod, setPayment] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [donateLoading, setDonateLoad] = useState(false)
  const [donateSuccess, setDonateOk] = useState(false)

  // Carousel Drag to Scroll State
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (desktopMenusRef.current && !desktopMenusRef.current.contains(e.target as Node)) {
        setFiturOpen(false)
        setDonasiOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiturOpen(false)
        setDonasiOpen(false)
        setProfileOpen(false)
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
    window.location.href = '/'
  }

  const handleDonate = async () => {
    const final = isOther ? parseInt(customNominal.replace(/\D/g, '')) : selectedNominal
    if (!final || !paymentMethod) return
    setDonateLoad(true)
    router.push(`/dashboard/siswa/donation?category=dakwah&nominal=${final}`)
  }

  const resetPopup = () => {
    setShowPopup(false)
    setSelected(null)
    setIsOther(false)
    setCustom('')
    setPayment('')
    setDonateOk(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-[#f8fffe] min-h-screen font-['Poppins',sans-serif] overflow-x-hidden">

      {/* ════ NAVBAR ════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#157a52] shadow-lg py-3' : 'bg-transparent pt-6 pb-4'}`}>
        <div className="max-w-[1378px] mx-auto px-6 flex items-center justify-between h-[72px]">

          <Link href="/">
            <img src={imgLogoWhite} alt="KajianQu" className="h-12 md:h-14 w-auto object-contain cursor-pointer" />
          </Link>

          <div ref={desktopMenusRef} className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link href="/" className="text-white text-[15px] font-medium hover:text-[#d3ad0f] transition-colors">Beranda</Link>

            {/* Fitur dropdown */}
            <div className="relative" onMouseEnter={openFitur} onMouseLeave={closeFitur}>
              <button type="button" aria-haspopup="menu" aria-expanded={fiturOpen} onClick={() => setFiturOpen((open) => !open)} className="flex items-center gap-2 text-white text-[15px] font-medium hover:text-[#d3ad0f] transition-colors focus:outline-none">
                Fitur <ChevronDown size={16} className={`transition-transform ${fiturOpen ? 'rotate-180' : ''}`} />
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
                    ].map((item) => (
                      <Link key={item.href} role="menuitem" href={item.href} className="rounded-lg px-4 py-3 text-[13px] font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-[#1a7a53]">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/kelas" className="text-white text-[15px] font-medium hover:text-[#d3ad0f] transition-colors">Kelas</Link>
            <Link href="/ustadz" className="text-white text-[15px] font-medium hover:text-[#d3ad0f] transition-colors">Ustadz</Link>

            {/* Donasi dropdown */}
            <div className="relative" onMouseEnter={openDonasi} onMouseLeave={closeDonasi}>
              <button type="button" aria-haspopup="menu" aria-expanded={donasiOpen} onClick={() => setDonasiOpen((open) => !open)} className="flex items-center gap-2 text-white text-[15px] font-medium hover:text-[#d3ad0f] transition-colors focus:outline-none">
                Donasi <ChevronDown size={16} className={`transition-transform ${donasiOpen ? 'rotate-180' : ''}`} />
              </button>
              {donasiOpen && (
                <div className="absolute top-full left-0 z-50 w-56 pt-2" role="menu">
                  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    <Link role="menuitem" href="/donasi/infaq-asatidz" className="block px-5 py-3 text-[14px] text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Infaq Asatidz</Link>
                    <Link role="menuitem" href="/donasi/sodaqoh" className="block px-5 py-3 text-[14px] text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Sodaqoh</Link>
                    <Link role="menuitem" href="/donasi/wakaf-quran" className="block px-5 py-3 text-[14px] text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Wakaf Al-Qur&apos;an</Link>
                    <Link role="menuitem" href="/donasi/katalog-produk" className="block px-5 py-3 text-[14px] text-gray-700 hover:bg-emerald-50 hover:text-[#1a7a53] font-medium transition-colors">Katalog Produk</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all px-4 py-2 rounded-full border border-white/20">
                  <div className="w-8 h-8 rounded-full bg-[#d3ad0f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                    {userProfile?.foto_url ? <img src={userProfile.foto_url} alt={firstName} className="w-full h-full object-cover" /> : <span>{initial}</span>}
                  </div>
                  <span className="text-white font-semibold text-[14px] hidden sm:block whitespace-nowrap">{firstName}</span>
                  <ChevronDown size={14} className={`text-white transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-[14px] shadow-xl overflow-hidden border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm truncate">{userProfile?.nama}</p>
                      <p className="text-xs text-gray-400 capitalize">{userProfile?.role || 'siswa'}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[14px] text-gray-600 hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors">
                      <User size={16} /> Profil Saya
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[14px] text-gray-600 hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-white text-[#157a52] text-[15px] font-bold px-7 py-2.5 rounded-[12px] hover:bg-[#d3ad0f] hover:text-white transition-all shadow-md">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ════ HERO SECTION ════ */}
      <section className="relative min-h-[880px] overflow-hidden flex items-center pt-32 pb-16 bg-gradient-to-b from-[#1a7a53] to-[#096942]">
        <img src="/ornamen-islamic.png" alt="" className="absolute -left-28 bottom-[-120px] w-[430px] opacity-15 pointer-events-none" />
        <img src="/ornamen-islamic.png" alt="" className="absolute right-[-180px] top-[-80px] w-[620px] opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-[1378px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <p className="text-[#d3ad0f] text-lg md:text-2xl font-semibold">KajianQu</p>
            <h1 className="mt-4 text-[40px] md:text-5xl font-semibold leading-[1.2] tracking-tight">
              {isLoggedIn ? <>Ahlan wa Sahlan,<br /><span className="text-[#d3ad0f]">{firstName}</span></> : <>Dekat dengan Al-Qur&apos;an,<br />Tenang di Hati</>}
            </h1>
            <p className="mt-5 max-w-[660px] text-base md:text-xl leading-relaxed text-white/90">
              KajianQu adalah web islami yang membantu kamu lebih dekat dengan Al-Qur&apos;an. Mulai dari membaca, doa, jadwal ibadah, hingga belajar Islam dengan mudah dalam satu tempat.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {isLoggedIn ? (
                <Link href="/quran-ai" className="rounded-[15px] bg-white px-8 py-3.5 font-semibold text-[#15441a] shadow-xl hover:bg-[#d3ad0f] hover:text-white transition-all">Mulai Ngaji</Link>
              ) : (
                <>
                  <img src={imgGooglePlay} alt="Google Play" className="h-12 md:h-16 w-auto object-contain" />
                  <img src={imgAppStore} alt="App Store" className="h-12 md:h-16 w-auto object-contain rounded-lg" />
                </>
              )}
            </div>
          </div>

          <div className="relative hidden lg:flex h-[610px] items-center justify-center" aria-label="Pratinjau aplikasi KajianQu">
            <div className="absolute left-16 top-36 w-[210px] h-[410px] rounded-[38px] border-[9px] border-[#0b382a] bg-white shadow-2xl overflow-hidden rotate-[-4deg]">
              <div className="h-28 bg-[#1a7a53] p-5 text-white"><p className="text-[10px] opacity-70">Assalamu&apos;alaikum</p><p className="mt-1 font-bold">Sahabat KajianQu</p></div>
              <div className="p-4 space-y-3"><div className="h-20 rounded-2xl bg-emerald-50 p-3 text-[#15441a]"><p className="text-[9px]">Jadwal berikutnya</p><p className="mt-2 text-lg font-bold">Ashar 15:20</p></div><div className="grid grid-cols-2 gap-2">{['Qur’an','Keilmuan','Kelas','Donasi'].map(label => <div key={label} className="rounded-xl bg-gray-50 py-4 text-center text-[9px] font-semibold text-[#15441a]">{label}</div>)}</div></div>
            </div>
            <div className="absolute right-12 top-6 w-[290px] h-[570px] rounded-[46px] border-[11px] border-[#0b382a] bg-white shadow-2xl overflow-hidden rotate-[3deg]">
              <div className="h-44 bg-gradient-to-b from-[#1a7a53] to-[#096942] p-7 text-white"><p className="text-xs opacity-70">Selamat datang</p><p className="mt-2 text-xl font-bold">KajianQu</p><div className="mt-6 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><p className="text-[10px] opacity-75">Waktu sholat</p><p className="text-2xl font-bold">15:20</p></div></div>
              <div className="p-5"><p className="text-sm font-bold text-[#15441a]">Lanjutkan belajar</p><div className="mt-4 h-28 rounded-2xl bg-emerald-50 p-4"><div className="h-12 rounded-xl bg-[#1a7a53]/15" /><p className="mt-3 text-[10px] font-semibold text-[#15441a]">Tahsin Al-Fatihah</p></div><div className="mt-4 grid grid-cols-3 gap-2">{['Ngaji','Kelas','Quiz'].map(label => <div key={label} className="rounded-xl border border-emerald-100 py-4 text-center text-[9px] font-semibold text-[#15441a]">{label}</div>)}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SEKAPUR SIRIH ════ */}
      <section id="tentang" className="py-16 md:py-20 px-6 max-w-[1378px] mx-auto relative scroll-mt-24">
        <h2 className="text-[#157a52] text-[28px] md:text-[36px] font-bold text-center mb-10 md:mb-14">Sekapur Sirih</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { img: imgUstadz1, name: "Ust. Hanan Attaki" },
            { img: imgUstadz2, name: "Ust. Adi Hidayat" },
            { img: imgUstadz3, name: "Ust. Abdul Somad" },
          ].map((item, i) => (
            <div key={i} className="relative rounded-[24px] overflow-hidden h-[420px] shadow-lg group cursor-pointer border border-[#157a52]/10">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#157a52]/90 via-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">{item.name}</p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 border-2 border-white rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <Play className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ MENGAPA KAJIANQU ════ */}
      <section className="py-16 md:py-20 px-6 bg-[#f8fffe] border-y border-gray-100">
        <div className="max-w-[1378px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-center mb-14 text-[#0c1421]">
            Mengapa <span className="text-[#157a52]">KajianQu?</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { icon: imgIconMateri, title: "Materi Lengkap", desc: "Mulai dari pengenalan huruf hingga pendalaman tajwid." },
              { icon: imgIconAI, title: "Koreksi AI", desc: "Teknologi AI mengoreksi bacaan kamu secara real-time." },
              { icon: imgIconUstadz, title: "Ustadz Profesional", desc: "Belajar bersama ustadz berpengalaman dan bersertifikat." },
              { icon: imgIconGratis, title: "Gratis", desc: "Akses seluruh fitur dasar tanpa biaya apapun." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center bg-white p-6 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center mb-4">
                  <img src={item.icon} alt={item.title} className="w-8 h-8 object-contain" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#0c1421]">{item.title}</h3>
                <p className="text-[#667085] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FITUR UNGGULAN AI ════ */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-[1378px] mx-auto text-center">
          <div className="inline-block border border-[#d3ad0f] text-[#d3ad0f] font-bold px-6 py-2 rounded-full text-sm bg-[#d3ad0f]/10 mb-6">
            Fitur Unggulan
          </div>
          <h2 className="text-[26px] md:text-[36px] font-bold text-[#0c1421] max-w-3xl mx-auto leading-tight mb-12">
            Koreksi Bacaan KajianQU Kamu dengan Teknologi <span className="text-[#157a52]">Artificial Intelligence</span>
          </h2>
          <div className="relative rounded-[24px] overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl border-[6px] border-white">
            <img src={imgVideoThumb} alt="Demo AI" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <Play className="text-[#0c1421] ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FITUR LAIN (CAROUSEL) ════ */}
      <section className="py-16 md:py-20 bg-[#f8fffe] border-t border-gray-100 relative">
        <div className="max-w-[1378px] mx-auto relative px-6">
          <h2 className="text-[#157a52] text-[28px] md:text-[36px] font-bold text-center mb-14">Fitur-fitur Lain</h2>
          <div className="relative group">
            <button onClick={() => scrollCarousel('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#157a52] hover:bg-[#157a52] hover:text-white transition-all">
              <ChevronLeft />
            </button>
            <div 
              ref={carouselRef} 
              onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
              className={`flex gap-8 overflow-x-auto pb-12 pt-4 select-none [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative rounded-[24px] overflow-hidden shadow-md flex-shrink-0 bg-white w-[280px] h-[400px] hover:-translate-y-2 transition-transform border border-gray-100 pointer-events-none">
                  <img src={imgFiturPhone} alt={`Fitur ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button onClick={() => scrollCarousel('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#157a52] hover:bg-[#157a52] hover:text-white transition-all">
              <ChevronRight />
            </button>
          </div>
          <div className="text-center mt-4">
            <h3 className="text-[33px] font-bold text-[#0c1421]">Sahabat Qur&apos;an</h3>
            <p className="text-gray-500 text-[17px]">Lengkap dengan koreksi AI</p>
          </div>
        </div>
      </section>

      {/* ════ IKUTI KELAS ════ */}
      <section className="bg-[#157a52] py-20 px-6 relative overflow-hidden">
        <div className="max-w-[1378px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <h2 className="text-[40px] font-bold leading-tight">Ikuti Kelas<br />unggulan kami</h2>
            <p className="text-white/90 max-w-md">Join KajianQu dan kuasai ilmu agama dengan mudah, menyenangkan, dan percaya diri kapanpun dan dimanapun.</p>
            <Link href="/kelas" className="inline-block bg-white text-[#157a52] font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-sm">
              Ikuti Kelas
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-[20px] overflow-hidden shadow-lg hover:-translate-y-2 transition-transform">
                <div className="relative h-[180px]">
                  <img src={imgKelasBlue} alt="Kelas" className="w-full h-full object-cover grayscale-[30%]" />
                  <div className="absolute bottom-3 left-3 bg-white text-[#157a52] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Ust. Adi Hidayat
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-[#0c1421]">Hukumnya Tahlilan</h4>
                  <div className="flex items-center text-xs text-gray-500 gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#157a52] rounded-full" /> Live Stream
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">Membahas Seputar Tahlilan, dan pertanyaan-pertanyaan umum lainnya...</p>
                  <Link href="/kelas" className="inline-flex items-center text-[#157a52] font-bold text-sm hover:underline">
                    Ikuti Kelas <ChevronRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ DONASI ════ */}
      <section className="py-20 px-6 bg-white max-w-[1378px] mx-auto">
        <div className="text-center mb-14 space-y-4">
          <h2 className="text-[#157a52] text-[28px] md:text-[36px] font-bold">Berbagai Pilihan Kebaikan</h2>
          <p className="text-[#667085] max-w-xl mx-auto">Setiap kebaikan adalah ladang pahala. Pilih program yang ingin kamu dukung.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: imgDonasi1, title: "Wakaf Al-Qur'an", href: "/donasi/wakaf-quran" },
            { img: imgDonasi2, title: "Sodaqoh", href: "/donasi/sodaqoh" },
            { img: imgDonasi3, title: "Infaq Asatidz", href: "/donasi/infaq-asatidz" },
            { img: imgDonasi4, title: "Katalog Produk", href: "/donasi/katalog-produk" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100 group">
              <div className="relative h-[200px]">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#157a52]/40 mix-blend-multiply group-hover:bg-[#157a52]/20 transition-colors" />
              </div>
              <div className="p-5">
                <h4 className="text-[#157a52] font-bold text-lg mb-4">{item.title}</h4>
                <Link href={item.href} className="text-[#157a52] font-bold text-sm flex items-center hover:underline">
                  Donasi disini <ChevronRight size={14} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ TESTIMONIAL ════ */}
      <section className="py-20 px-6 bg-[#f8fffe] border-t border-gray-100">
        <div className="max-w-[1378px] mx-auto">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-[#157a52] text-[28px] md:text-[36px] font-bold">Apa Kata Mereka</h2>
            <p className="text-[#667085] max-w-xl mx-auto">Pengalaman nyata dari para pengguna yang telah merasakan manfaat aplikasi ini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ahmad Dahlan", role: "Pengajar" },
              { name: "Siti Aisyah", role: "Ibu Rumah Tangga" },
              { name: "Budi Santoso", role: "Mahasiswa" },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-[#e2ece7] p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={imgAvatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-[#0c1421]">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed text-justify italic">
                  &ldquo;Aplikasi ini bukan cuma sekadar platform islami biasa. Dari sisi desain dan pengalaman pengguna, semuanya terasa matang dan terstruktur.&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA BOTTOM ════ */}
      <section className="bg-[#157a52] py-20 px-6 relative overflow-hidden">
        <div className="max-w-[1378px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 text-white">
          <div className="space-y-6">
            <h2 className="text-[40px] font-bold leading-tight">Siap mendalami<br className="hidden lg:block" />ilmu Alquran & Akhlaq?</h2>
            <p className="text-white/90 max-w-md">Bergabunglah bersama kami untuk mempelajari ilmu agama secara mendalam dan terstruktur.</p>
            <div className="pt-2">
              <p className="font-bold text-3xl">+18 M</p>
              <p className="text-white/80 text-sm">Pengguna Aktif</p>
            </div>
            <div className="flex gap-4">
              <img src={imgGooglePlay} alt="Google Play" className="h-12 cursor-pointer hover:opacity-80" />
              <img src={imgAppStore} alt="App Store" className="h-12 cursor-pointer hover:opacity-80 rounded-lg" />
            </div>
          </div>
          <div className="flex justify-center">
            <img src={imgHeroPhone} alt="App Preview" className="h-[400px] object-contain drop-shadow-2xl translate-y-10 rounded-[20px]" />
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
        <div className="max-w-[1378px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4 space-y-6">
            <img src={imgLogoColor} alt="KajianQu" className="h-16 object-contain" />
            <p className="text-gray-500 text-sm leading-relaxed max-w-[90%]">
              KajianQu adalah platform islami terpadu untuk membaca Al-Qur&apos;an, doa, dan belajar Islam dengan mudah dan nyaman.
            </p>
            <div className="flex gap-4">
              <a href="https://wa.me/6282262170018" target="_blank" rel="noreferrer" aria-label="WhatsApp KajianQu" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#157a52] transition-colors border group">
                <img src={imgWA} alt="WhatsApp" className="w-5 h-5 group-hover:brightness-0 group-hover:invert" />
              </a>
              <a href="https://www.instagram.com/kajian_qu/" target="_blank" rel="noreferrer" aria-label="Instagram KajianQu" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#157a52] transition-colors border group">
                <img src={imgIG} alt="Instagram" className="w-5 h-5 group-hover:brightness-0 group-hover:invert" />
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-[#0c1421] uppercase tracking-wider text-sm">Perusahaan</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/welcome#tentang" className="hover:text-[#157a52]">Tentang Kami</Link></li>
              <li><Link href="/welcome#tentang" className="hover:text-[#157a52]">Visi &amp; Misi</Link></li>
              <li><Link href="/kelas" className="hover:text-[#157a52]">Tim Asatidz</Link></li>
              <li><Link href="/bantuan" className="hover:text-[#157a52]">Kontak Kami</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-[#0c1421] uppercase tracking-wider text-sm">Program Kelas</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <ul className="space-y-4">
                <li><Link href="/keilmuan?topik=Fiqih" className="hover:text-[#157a52]">Fiqih</Link></li>
                <li><Link href="/keilmuan?topik=Akhlak" className="hover:text-[#157a52]">Akhlak</Link></li>
                <li><Link href="/quran-ai?mode=murojaah" className="hover:text-[#157a52]">Tahfidz</Link></li>
              </ul>
              <ul className="space-y-4">
                <li><Link href="/keilmuan?topik=Akidah" className="hover:text-[#157a52]">Akidah</Link></li>
                <li><Link href="/keilmuan?topik=Tafsir" className="hover:text-[#157a52]">Tafsir</Link></li>
                <li><Link href="/quran-ai?mode=belajar" className="hover:text-[#157a52]">Tajwid</Link></li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-[#0c1421] uppercase tracking-wider text-sm">Unduh Aplikasi</h4>
            <p className="text-gray-500 text-sm">Dapatkan pengalaman belajar yang lebih baik di smartphone Anda.</p>
            <div className="flex flex-col gap-4">
              <img src={imgGooglePlay} className="h-10 object-contain cursor-pointer" />
              <img src={imgAppStore} className="h-10 object-contain cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="max-w-[1378px] mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} KajianQu. Hak Cipta Dilindungi.</p>
          <div className="flex gap-8">
            <Link href="/syarat-ketentuan" className="hover:text-[#157a52]">Syarat &amp; Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-[#157a52]">Kebijakan Privasi</Link>
          </div>
        </div>
      </footer>

      {/* ════ DONATION POPUP (MODAL) ════ */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-[700px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <span className="text-sm text-gray-600 font-bold">PopUp Donasi</span>
              <button onClick={resetPopup} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300">
                <X size={16} />
              </button>
            </div>
            {donateSuccess ? (
              <div className="p-12 text-center space-y-5">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon />
                </div>
                <h3 className="text-3xl font-bold text-[#157a52]">Alhamdulillah!</h3>
                <p className="text-gray-500 text-lg">Donasi kamu berhasil diproses. Jazakumullahu khairan katsiran.</p>
                <button onClick={resetPopup} className="mt-6 px-10 py-3.5 bg-[#157a52] text-white rounded-full font-bold shadow-md hover:bg-[#0c2e1c]">
                  Tutup Papan
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#0c1421]">Yuk, Bantu Support Program Kebaikan KajianQu</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <p className="text-[#157a52] font-bold text-sm">Pilih Nominal Infaq</p>
                    <div className="grid grid-cols-2 gap-3">
                      {NOMINALS.map((n) => (
                        <button key={n.value} onClick={() => { setSelected(n.value); setIsOther(false); setCustom('') }}
                          className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                            selectedNominal === n.value && !isOther ? 'border-[#157a52] bg-[#157a52] text-white' : 'border-gray-200 text-gray-600 hover:border-[#157a52]'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                      <button onClick={() => { setIsOther(true); setSelected(null) }}
                        className={`col-span-2 py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                          isOther ? 'border-[#157a52] bg-[#157a52] text-white' : 'border-gray-200 text-gray-600 hover:border-[#157a52]'
                        }`}
                      >
                        Nominal Lainnya
                      </button>
                    </div>
                    <div className={`flex items-center border rounded-xl px-4 h-14 gap-2 ${isOther ? 'border-[#157a52] ring-2 ring-[#157a52]/20' : 'border-gray-200 bg-gray-50'}`}>
                      <span className="text-[#157a52] font-bold">Rp</span>
                      <input type="text" placeholder="Masukkan angka" disabled={!isOther}
                        value={isOther ? customNominal : selectedNominal ? selectedNominal.toLocaleString('id-ID') : ''}
                        onChange={e => setCustom(e.target.value)}
                        className="flex-1 bg-transparent font-semibold text-gray-800 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <button onClick={() => setPaymentOpen(!paymentOpen)} className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 h-14 text-sm font-medium bg-white">
                        <span className={paymentMethod ? 'text-gray-800' : 'text-gray-400'}>{paymentMethod || 'Pilih Metode Pembayaran'}</span>
                        <ChevronDown size={18} className={`transition-transform ${paymentOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {paymentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto p-2">
                          {PAYMENT_METHODS.map((m) => (
                            <button key={m} onClick={() => { setPayment(m); setPaymentOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 rounded-lg">
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={handleDonate} disabled={donateLoading || (!selectedNominal && !customNominal) || !paymentMethod}
                      className="w-full h-14 bg-[#157a52] text-white rounded-xl font-bold hover:bg-[#0c2e1c] disabled:opacity-50"
                    >
                      {donateLoading ? 'Memproses...' : 'Lanjutkan Donasi'}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                    <p className="text-[#0c1421] font-bold text-sm border-b pb-3">Ringkasan Program Kami</p>
                    <div className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border">
                      <img src={imgEAbsensi} alt="Program E-Absensi Pesantren" className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-xs">E-Absensi Pesantren</h4>
                        <p className="text-gray-500 text-[10px] mt-1 italic">Digitalisasi kehadiran santri secara real-time.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border">
                      <img src={imgCBT} alt="Program CBT Ujian Online" className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-xs">CBT Ujian Online</h4>
                        <p className="text-gray-500 text-[10px] mt-1 italic">Sistem ujian berbasis komputer santri.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper SVG Component
function CheckCircleIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}
