// app/layout.tsx
// Root layout — load font Poppins sesuai design Figma
// Poppins adalah font utama di seluruh project KajianQu

import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

// Load Poppins dengan semua weight yang dipakai di Figma
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

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
    <html lang="id" className={poppins.variable}>
      <body className="antialiased font-poppins">
        {children}
      </body>
    </html>
  )
}