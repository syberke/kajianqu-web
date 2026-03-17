import Link from 'next/link'

const imgLogo = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgWA = "https://www.figma.com/api/mcp/asset/ed224d43-6035-45b3-8bfb-f68c55df083d"
const imgIG = "https://www.figma.com/api/mcp/asset/4cee5b06-85b4-4dee-892e-f4d6251bac5e"

export default function PublicFooter() {
  return (
    <footer className="border-t-2 border-[#1a7a53] py-16 px-6 font-['Poppins',sans-serif]">
      <div className="max-w-[1378px] mx-auto flex flex-col md:flex-row justify-between gap-12">

        {/* Brand */}
        <div className="max-w-sm space-y-4">
          <Link href="/">
            <img src={imgLogo} alt="KajianQu" className="h-[76px] w-auto object-contain" />
          </Link>
          <p className="text-black text-lg leading-relaxed">
            QuranKu adalah platform islami untuk membaca Al-Qur'an, doa, dan belajar Islam dengan mudah dan nyaman.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
              <img src={imgWA} alt="WhatsApp" className="w-10 h-10 object-contain hover:opacity-70 transition-opacity" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
              <img src={imgIG} alt="Instagram" className="w-10 h-10 object-contain hover:opacity-70 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-16">

          {/* Tentang Kami */}
          <div className="space-y-[17px]">
            <p className="font-semibold text-2xl text-black">Tentang Kami</p>
            {['Sekilas QuranKu', 'Visi Misi', 'Ustadz'].map((item) => (
              <Link
                key={item}
                href="#"
                className="block text-xl text-black hover:text-[#1a7a53] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Kelas */}
          <div className="flex gap-10">
            <div className="space-y-[17px]">
              <p className="font-semibold text-2xl text-black">Kelas</p>
              {['Fiqih', 'Akhlak', 'Tahfidz'].map((item) => (
                <Link
                  key={item}
                  href="/dashboard/siswa/kelas"
                  className="block text-xl text-black hover:text-[#1a7a53] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="space-y-[17px]">
              {/* spacer untuk align dengan kolom pertama */}
              <p className="font-semibold text-2xl text-transparent select-none">Kelas</p>
              {['Akidah', 'Tafsir'].map((item) => (
                <Link
                  key={item}
                  href="/dashboard/siswa/kelas"
                  className="block text-xl text-black hover:text-[#1a7a53] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Waktu Sholat */}
          <div>
            <p className="font-semibold text-2xl text-black">Waktu Sholat</p>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1378px] mx-auto mt-12 pt-6 border-t border-gray-200">
        <p className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} KajianQu. All rights reserved.
        </p>
      </div>
    </footer>
  )
}