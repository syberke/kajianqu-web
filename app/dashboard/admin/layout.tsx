'use client' // WAJIB ADA karena kita pakai fitur pembaca URL (usePathname)

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, Wallet, Settings, Bell, Moon, Search, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() // Mendapatkan URL saat ini

  // Fungsi kecil untuk menentukan warna menu (Aktif vs Tidak Aktif)
  const menuClass = (path: string) => {
    // Jika URL saat ini sama dengan path menu, jadikan hijau. Jika tidak, abu-abu.
    const isActive = pathname === path || (path !== '/dashboard/admin' && pathname.startsWith(path))
    
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
      isActive 
        ? 'bg-[#E8F5E9] text-[#064E3B] font-bold' 
        : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-[#064E3B]'
    }`
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed h-screen z-20">
        <div>
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <div>
                <h1 className="font-bold text-[#064E3B] text-xl leading-tight">Kajian<span className="text-[#10B981]">Qu</span></h1>
                <p className="text-[10px] text-gray-500 font-medium">Admin Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <Link href="/dashboard/admin" className={menuClass('/dashboard/admin')}>
              <LayoutDashboard size={20} />
              <span className="text-sm">Dashboard</span>
            </Link>
            
         
            <Link href="/dashboard/admin/verifikasi" className={menuClass('/dashboard/admin/verifikasi')}>
              <Users size={20} />
              <span className="text-sm">Verifikasi asatidz</span>
            </Link> 
            <Link href="/dashboard/admin/materi" className={menuClass('/dashboard/admin/materi')}>
              <BookOpen size={20} />
              <span className="text-sm">Materi Keilmuan</span>
            </Link>
            
            <Link href="/dashboard/admin/donasi" className={menuClass('/dashboard/admin/donasi')}>
              <Wallet size={20} />
              <span className="text-sm">Donasi</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <Link href="/dashboard/admin/settings" className={menuClass('/dashboard/admin/settings')}>
            <Settings size={20} />
            <span className="text-sm">Pengaturan</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 mt-2">
            <div className="w-10 h-10 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold">
              AK
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Admin KajianQu</p>
              <p className="text-xs text-gray-500">admin@kajianqu.com</p>
            </div>
          </div>
          <Link href="/logout" className="flex items-center gap-3 px-4 py-2 mt-2 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <LogOut size={18} />
            <span className="text-sm">Keluar</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto">
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Pencarian data, asatidz, atau transaksi..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-[#064E3B] transition-colors"><Bell size={20} /></button>
            <button className="hover:text-[#064E3B] transition-colors"><Moon size={20} /></button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}