'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

// Assets dari Figma
const imgIconAsatidz = "https://www.figma.com/api/mcp/asset/46c4cc69-f660-4fc4-812f-4691485a31d8"
const imgIconPengguna = "https://www.figma.com/api/mcp/asset/0a2fc4d6-c4af-46da-9e58-7dbc567695fc"

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

      {/* Background pattern — grid dots */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(209,250,229,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-[1152px] flex flex-col gap-16 items-center">

        {/* Header */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight">
            Pilih Peran Anda
          </h1>
          <p className="text-[rgba(209,250,229,0.8)] text-xl max-w-lg leading-relaxed">
            Mulai perjalanan pembelajaran Anda dengan memilih peran yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-4">
          {cards.map((card) => (
            <div
              key={card.role}
              className="bg-white rounded-[24px] p-10 flex flex-col items-center shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] border border-[rgba(255,255,255,0.1)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon */}
              <div className="bg-[rgba(27,60,53,0.1)] w-20 h-20 rounded-[16px] flex items-center justify-center mb-8">
                <img src={card.icon} alt={card.title} className="w-10 h-10 object-contain" />
              </div>

              {/* Title */}
              <h2 className="text-[30px] font-bold text-[#111827] text-center leading-tight mb-2">
                {card.title}
              </h2>

              {/* Subtitle */}
              <p className="text-[#1b3c35] text-lg text-center mb-4">
                {card.subtitle}
              </p>

              {/* Description */}
              <p className="text-[#6b7280] text-base text-center leading-relaxed mb-8 max-w-sm">
                {card.description}
              </p>

              {/* Feature list */}
              <ul className="w-full space-y-4 mb-10">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#1b3c35] shrink-0" />
                    <span className="text-[#374151] text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={card.href}
                className="w-full bg-[#1b3c35] text-white text-lg font-bold text-center py-4 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(27,60,53,0.2),0px_4px_6px_-4px_rgba(27,60,53,0.2)] hover:bg-[#1a7a53] transition-colors active:scale-95"
              >
                Pilih
              </Link>
            </div>
          ))}
        </div>

        {/* Footer branding */}
        <p className="text-[rgba(209,250,229,0.5)] text-sm text-center">
          Aplikasi Pembelajaran Islam Modern
        </p>

      </div>
    </div>
  )
}