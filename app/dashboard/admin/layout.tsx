'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from 'lucide-react'

interface NotificationItem {
  id: string
  type: string | null
  title: string
  description: string | null
  is_read: boolean
  created_at: string
}

interface AdminSidebarProps {
  pathname: string
  onNavigate: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/verifikasi', label: 'Verifikasi', icon: Users },
  { href: '/dashboard/admin/materi', label: 'Materi', icon: BookOpen },
  { href: '/dashboard/admin/donasi', label: 'Donasi', icon: Wallet },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: Users },
] as const

function adminNavClass(pathname: string, href: string) {
  const active = pathname === href || (href !== '/dashboard/admin' && pathname.startsWith(href))
  return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
    active ? 'bg-emerald-50 font-bold text-[#064E3B]' : 'text-slate-500 hover:bg-slate-50 hover:text-[#064E3B]'
  }`
}

function AdminSidebar({ pathname, onNavigate }: AdminSidebarProps) {
  return (
    <>
      <div>
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <div>
            <h1 className="text-xl font-bold text-[#064E3B]">Kajian<span className="text-emerald-500">Qu</span></h1>
            <p className="text-xs text-slate-500">Admin Management</p>
          </div>
        </div>
        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate} className={adminNavClass(pathname, item.href)}>
                <Icon size={19} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-slate-100 p-4">
        <Link href="/dashboard/admin/settings" onClick={onNavigate} className={adminNavClass(pathname, '/dashboard/admin/settings')}>
          <Settings size={19} />
          Pengaturan
        </Link>
        <Link href="/logout" className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50">
          <LogOut size={18} />
          Keluar
        </Link>
      </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const page = useMemo(() => {
    if (pathname.startsWith('/dashboard/admin/donasi')) return ['Donasi', 'Kelola transaksi dan program donasi.']
    if (pathname.startsWith('/dashboard/admin/materi')) return ['Materi Keilmuan', 'Kelola konten pembelajaran KajianQu.']
    if (pathname.startsWith('/dashboard/admin/verifikasi')) return ['Verifikasi Asatidz', 'Tinjau dan kelola pendaftaran asatidz.']
    if (pathname.startsWith('/dashboard/admin/reports')) return ['Reports', 'Unduh laporan operasional aplikasi.']
    if (pathname.startsWith('/dashboard/admin/settings')) return ['Settings', 'Konfigurasi sistem dan layanan.']
    return ['Dashboard', 'Ringkasan aktivitas KajianQu.']
  }, [pathname])

  useEffect(() => {
    let cancelled = false
    const loadNotifications = async () => {
      const response = await fetch('/api/admin/notifications', { headers: { Accept: 'application/json' } })
      if (!response.ok || cancelled) return
      const payload = (await response.json()) as {
        notifications?: NotificationItem[]
        unreadCount?: number
      }
      setNotifications(payload.notifications ?? [])
      setUnreadCount(payload.unreadCount ?? 0)
    }
    void loadNotifications()
    return () => {
      cancelled = true
    }
  }, [])

  const markRead = async (item: NotificationItem) => {
    if (item.is_read) return
    const response = await fetch('/api/admin/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    })
    if (!response.ok) return
    setNotifications((items) => items.map((current) => current.id === item.id ? { ...current, is_read: true } : current))
    setUnreadCount((count) => Math.max(0, count - 1))
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
        <AdminSidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Tutup menu" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col justify-between bg-white shadow-2xl">
            <button type="button" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            <AdminSidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Buka menu"><Menu size={20} /></button>
            <div>
              <h1 className="font-bold text-slate-900">{page[0]}</h1>
              <p className="hidden text-xs text-slate-500 sm:block">{page[1]}</p>
            </div>
          </div>

          <div className="relative">
            <button type="button" onClick={() => setNotificationOpen((open) => !open)} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" aria-label="Notifikasi">
              <Bell size={19} />
              {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{Math.min(unreadCount, 99)}</span>}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-[min(90vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p className="font-bold text-slate-900">Notifikasi</p><span className="text-xs text-slate-500">{unreadCount} belum dibaca</span></div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-slate-500">Belum ada notifikasi.</p>
                  ) : notifications.map((item) => (
                    <button type="button" key={item.id} onClick={() => void markRead(item)} className={`w-full rounded-xl p-3 text-left transition hover:bg-slate-50 ${item.is_read ? '' : 'bg-emerald-50/70'}`}>
                      <div className="flex items-start gap-2">
                        {!item.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          {item.description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>}
                          <p className="mt-1.5 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
