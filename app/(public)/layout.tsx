// app/(public)/layout.tsx
// Layout untuk semua halaman publik:
//   /welcome, /kelas, /kelas/live/[id], /kelas/tematik/[id], /role-select
//
// Navbar diletakkan DI SINI — tidak perlu import navbar di masing-masing page
// Cek apakah user sudah login → kirim ke PublicNavbar
// PublicNavbar yang memutuskan tampilkan "Masuk" atau avatar+dropdown

import { createClient } from '@/supabase/server'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, email, foto_url, role')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  return (
    <>
      {/* 
        PublicNavbar dipasang SATU KALI di sini.
        Semua halaman di dalam (public)/ otomatis dapat navbar ini.
        Tidak perlu import navbar di welcome/page.tsx, kelas/page.tsx, dll.
        
        userProfile:
          null → navbar tampilkan tombol "Masuk"
          ada  → navbar tampilkan avatar + nama + dropdown logout
      */}
      <PublicNavbar userProfile={userProfile} />
      
      <main>
        {children}
      </main>
      
      <PublicFooter />
    </>
  )
}