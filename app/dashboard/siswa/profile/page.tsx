'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Mail, Phone, Camera, ShieldCheck, LogOut, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SiswaProfilePage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(false)
  const [profile, setProfile]   = useState<any>(null)
  const [message, setMessage]   = useState('')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    const { error } = await supabase.from('profiles')
      .update({ nama: profile.nama, no_wa: profile.no_wa, updated_at: new Date() })
      .eq('id', profile.id)
    if (!error) {
      setMessage('Profil berhasil diperbarui!')
      setTimeout(() => setMessage(''), 3000)
    }
    setUpdating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Header */}
      <div className="bg-[#064E3B] pt-20 pb-32 px-6 rounded-b-[60px] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Pengaturan Profil</h1>
          <p className="text-emerald-100/60 text-sm mt-2">Kelola informasi pribadi dan keamanan akun Anda</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar Foto */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-emerald-50 shadow-inner">
                  <img
                    src={profile?.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nama || 'U')}&background=10b981&color=fff&size=200`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="font-black text-emerald-900 text-lg text-center leading-tight">{profile?.nama}</h3>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mt-2">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{profile?.role || 'Siswa'}</span>
              </div>
            </div>

            <button onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-600 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={18} /> Keluar Akun
            </button>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[48px] shadow-xl border border-gray-100 space-y-8">
              {message && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-bold">{message}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="text" value={profile?.nama || ''} onChange={e => setProfile({...profile, nama: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email (Hanya Baca)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="email" value={profile?.email || ''} disabled
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input type="text" value={profile?.no_wa || ''} onChange={e => setProfile({...profile, no_wa: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={updating}
                className="w-full py-5 bg-[#1D794E] text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}