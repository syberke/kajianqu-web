// app/layout.tsx
// Root layout — load font Poppins sesuai design Figma
// Poppins adalah font utama di seluruh project KajianQu

import type { Metadata } from "next"
import './globals.css'

export const metadata: Metadata = {
  title: "KajianQu — Dekat dengan Al-Qur'an, Tenang di Hati",
  description:
    "KajianQU adalah web islami yang membantu kamu lebih dekat dengan Al-Qur'an. Mulai dari membaca, doa, jadwal ibadah, hingga belajar Islam dengan mudah dalam satu tempat.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-poppins">
        {children}
      </body>
    </html>
  )
}
