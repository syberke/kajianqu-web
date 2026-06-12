'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Settings,
  Bell,
  LogOut
} from 'lucide-react'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const [showNotif, setShowNotif] = useState(false)

  // Fungsi untuk Judul Utama (H1)
  const pageTitle = () => {
    if (pathname.startsWith('/dashboard/admin/donasi')) return 'Donasi'
    if (pathname.startsWith('/dashboard/admin/materi')) return 'Materi Keilmuan'
    if (pathname.startsWith('/dashboard/admin/verifikasi')) return 'Verifikasi Asatidz'
    if (pathname.startsWith('/dashboard/admin/reports')) return 'Reports'
    if (pathname.startsWith('/dashboard/admin/settings')) return 'Settings'
    return 'Dashboard'
  }

  // BARU: Fungsi untuk Sub-judul / Deskripsi yang mengikuti Path URL
  const pageSubtitle = () => {
    if (pathname.startsWith('/dashboard/admin/donasi')) return '/dashboard/admin/donasi'
    if (pathname.startsWith('/dashboard/admin/materi')) return '/dashboard/admin/materi'
    if (pathname.startsWith('/dashboard/admin/verifikasi')) return '/dashboard/admin/verifikasi'
    if (pathname.startsWith('/dashboard/admin/reports')) return '/dashboard/admin/reports'
    if (pathname.startsWith('/dashboard/admin/settings')) return '/dashboard/admin/settings'
    return '/dashboard/admin'
  }

  const menuClass = (path: string) => {
    const isActive =
      pathname === path ||
      (path !== '/dashboard/admin' && pathname.startsWith(path))

    return `
      flex items-center gap-3
      px-4 py-3 rounded-xl
      transition-colors
      ${
        isActive
          ? 'bg-[#E8F5E9] text-[#064E3B] font-bold'
          : 'text-gray-500 hover:bg-gray-50 hover:text-[#064E3B]'
      }
    `
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 flex flex-col justify-between z-20">
        <div>
          <div className="h-20 flex items-center px-6 border-b">
            <div>
              <h1 className="font-bold text-xl text-[#064E3B]">
                Kajian<span className="text-[#10B981]">Qu</span>
              </h1>
              <p className="text-xs text-gray-500">
                Admin Management
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard/admin"
              className={menuClass('/dashboard/admin')}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            <Link
              href="/dashboard/admin/verifikasi"
              className={menuClass('/dashboard/admin/verifikasi')}
            >
              <Users size={20} />
              Verifikasi
            </Link>

            <Link
              href="/dashboard/admin/materi"
              className={menuClass('/dashboard/admin/materi')}
            >
              <BookOpen size={20} />
              Materi
            </Link>

            <Link
              href="/dashboard/admin/donasi"
              className={menuClass('/dashboard/admin/donasi')}
            >
              <Wallet size={20} />
              Donasi
            </Link>

            <Link
              href="/dashboard/admin/reports"
              className={menuClass('/dashboard/admin/reports')}
            >
              <Users size={20} />
              Reports
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t">
          <Link
            href="/dashboard/admin/settings"
            className={menuClass('/dashboard/admin/settings')}
          >
            <Settings size={20} />
            Pengaturan
          </Link>

          <Link
            href="/logout"
            className="flex items-center gap-3 px-4 py-3 text-red-500"
          >
            <LogOut size={18} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 ml-64">

        {/* HEADER */}
        <header className="h-20 bg-white border-b flex justify-between items-center px-8">
          <div>
            <h1 className="font-bold text-xl text-[#064E3B]">
                 {pageSubtitle()}
            </h1>

          </div>

          <div className="flex items-center gap-6">
            {/* Notification */}
            <div className="relative">
              {/* Tempat ikon notifikasi jika diperlukan */}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>

      </main>

    </div>
  )
}