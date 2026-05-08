'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const imgIconAsatidz  = "https://cdn-icons-png.flaticon.com/512/1945/1945648.png"
const imgIconPengguna = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"

const cards = [
  {
    icon: imgIconAsatidz,
    role: 'asatidz',
    title: 'Asatidz',
    subtitle: 'Guru dan Pendidik Islam',
    description: 'Kelola kelas, buat konten, dan bagikan pengetahuan Islam kepada santri di seluruh dunia.',
    features: ['Kelola Kelas', 'Buat Konten', 'Upload Materi'],
    href: '/register/asatidz?role=asatidz',
  },
  {
    icon: imgIconPengguna,
    role: 'siswa',
    title: 'Pengguna',
    subtitle: 'Pelajar dan Pencari Ilmu',
    description: 'Ikuti kelas, belajar ngaji, dan jelajahi berbagai kajian ilmu agama dengan mudah dan interaktif.',
    features: ['Ikuti Kelas', 'Belajar Ngaji', 'Kajian Ilmu'],
    href: '/register/siswa?role=siswa',
  },
]

export default function RoleSelectPage() {
  return (
    <div className="min-h-screen bg-[#1b3c35] relative overflow-hidden flex flex-col items-center justify-center px-6 py-20 font-['Poppins',sans-serif]">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(209,250,229,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 w-full max-w-[1152px] flex flex-col gap-16 items-center">
        <div className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">Pilih Peran Anda</h1>
          <p className="text-[rgba(209,250,229,0.8)] text-xl max-w-lg leading-relaxed">
            Mulai perjalanan pembelajaran Anda dengan memilih peran yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-4">
          {cards.map(card => (
            <div key={card.role} className="bg-white rounded-[24px] p-10 flex flex-col items-center shadow-xl border border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-[rgba(27,60,53,0.1)] w-20 h-20 rounded-[16px] flex items-center justify-center mb-8">
                <img src={card.icon} alt={card.title} className="w-10 h-10 object-contain" />
              </div>
              <h2 className="text-[30px] font-bold text-[#111827] text-center leading-tight mb-2">{card.title}</h2>
              <p className="text-[#1b3c35] text-lg text-center mb-4">{card.subtitle}</p>
              <p className="text-[#6b7280] text-base text-center leading-relaxed mb-8 max-w-sm">{card.description}</p>
              <ul className="w-full space-y-4 mb-10">
                {card.features.map(feature => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#1b3c35] shrink-0" />
                    <span className="text-[#374151] text-base">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={card.href} className="w-full bg-[#1b3c35] text-white text-lg font-bold text-center py-4 rounded-[12px] hover:bg-[#1a7a53] transition-colors active:scale-95">
                Pilih
              </Link>
            </div>
          ))}
        </div>

        <p className="text-[rgba(209,250,229,0.5)] text-sm text-center">Aplikasi Pembelajaran Islam Modern</p>
      </div>
    </div>
  )
}