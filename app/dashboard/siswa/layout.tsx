import Navbar from '../../../components/navbar'
import { requireRole } from '@/lib/helpers/auth'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  
  const { profile } = await requireRole('siswa')

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar userProfile={profile} />
      <main>{children}</main>
      
     
    </div>
  )
}