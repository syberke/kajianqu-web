import Link from 'next/link'

// Definisikan asset dengan benar
const imgLogo = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgWA = "https://www.figma.com/api/mcp/asset/ed224d43-6035-45b3-8bfb-f68c55df083d"
const imgIG = "https://www.figma.com/api/mcp/asset/4cee5b06-85b4-4dee-892e-f4d6251bac5e"

// Tambahkan variabel yang tadi kurang agar tidak eror
const imgGooglePlay = "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
const imgAppStore = "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"

export default function PublicFooter() {
  return (
      <footer className="bg-white border-t border-gray-100 pt-16 md:pt-24 pb-10 px-6 relative z-20">
  <div className="max-w-[1378px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-16 pb-12 md:pb-20">
    
    {/* BAGIAN LOGO & DESKRIPSI */}
    <div className="lg:col-span-4 space-y-6 md:space-y-8">
      {/* UKURAN LOGO DIPERBESAR: h-16 (desktop) & h-14 (mobile) */}
      <img 
        src={imgLogo} 
        alt="KajianQu" 
        className="h-14 md:h-16 lg:h-20 object-contain -ml-2 transition-transform hover:scale-105 duration-300" 
      />
      
      <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed max-w-full md:max-w-[85%]">
        KajianQu adalah platform islami terpadu untuk membaca Al-Qur'an, doa, dan belajar Islam dengan mudah, nyaman, dan interaktif.
      </p>
      
      <div className="flex gap-4 pt-2">
        <a href="#" className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#157a52] transition-all duration-300 group border border-gray-100 shadow-sm">
          <img src={imgWA} alt="WhatsApp" className="w-5 h-5 object-contain group-hover:brightness-0 group-hover:invert transition-all" />
        </a>
        <a href="#" className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#157a52] transition-all duration-300 group border border-gray-100 shadow-sm">
          <img src={imgIG} alt="Instagram" className="w-5 h-5 object-contain group-hover:brightness-0 group-hover:invert transition-all" />
        </a>
      </div>
    </div>

    {/* LINK PERUSAHAAN */}
    <div className="lg:col-span-2 space-y-6">
      <h4 className="font-bold text-[#0c1421] text-[16px] uppercase tracking-wider">Perusahaan</h4>
      <ul className="space-y-4">
        {['Tentang Kami', 'Visi & Misi', 'Tim Asatidz', 'Kontak Kami'].map(l => (
          <li key={l}><a href="#" className="text-gray-500 hover:text-[#157a52] text-[14px] font-medium transition-colors">{l}</a></li>
        ))}
      </ul>
    </div>

    {/* PROGRAM KELAS */}
    <div className="lg:col-span-3 space-y-6">
      <h4 className="font-bold text-[#0c1421] text-[16px] uppercase tracking-wider">Program Kelas</h4>
      <div className="grid grid-cols-2 gap-4">
        <ul className="space-y-4">
          {['Fiqih', 'Akhlak', 'Tahfidz'].map(l => (
            <li key={l}><a href="#" className="text-gray-500 hover:text-[#157a52] text-[14px] font-medium transition-colors">{l}</a></li>
          ))}
        </ul>
        <ul className="space-y-4">
          {['Akidah', 'Tafsir', 'Tajwid'].map(l => (
            <li key={l}><a href="#" className="text-gray-500 hover:text-[#157a52] text-[14px] font-medium transition-colors">{l}</a></li>
          ))}
        </ul>
      </div>
    </div>

    {/* BAGIAN DOWNLOAD APLIKASI */}
    <div className="lg:col-span-3 space-y-6">
      <h4 className="font-bold text-[#0c1421] text-[16px] uppercase tracking-wider">Unduh Aplikasi</h4>
      <p className="text-gray-500 text-[14px] leading-relaxed">Dapatkan pengalaman belajar yang lebih baik di smartphone Anda.</p>
      
      {/* UKURAN BADGE STORE DIPERBESAR: h-[50px] (desktop) & h-[45px] (mobile) */}
      <div className="flex flex-col gap-4">
        <img 
          src={imgGooglePlay} 
          alt="Google Play" 
          className="h-[45px] md:h-[52px] object-contain cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl" 
        />
        <img 
          src={imgAppStore} 
          alt="App Store" 
          className="h-[45px] md:h-[52px] object-contain cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 rounded-xl" 
        />
      </div>
    </div>
  </div>

  {/* BOTTOM FOOTER */}
  <div className="max-w-[1378px] mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
    <p className="text-gray-400 text-[14px]">© {new Date().getFullYear()} KajianQu. Hak Cipta Dilindungi.</p>
    <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[14px]">
      <a href="#" className="text-gray-400 hover:text-[#157a52] transition-colors font-medium">Syarat & Ketentuan</a>
      <a href="#" className="text-gray-400 hover:text-[#157a52] transition-colors font-medium">Kebijakan Privasi</a>
      <a href="#" className="text-gray-400 hover:text-[#157a52] transition-colors font-medium">Bantuan</a>
    </div>
  </div>
</footer>
  )
}