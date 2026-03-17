'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const imgLoginArt = "https://www.figma.com/api/mcp/asset/1a24b781-4731-4611-b596-24fd10d1c517"
const imgLogo     = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"
const imgGoogle   = "https://www.figma.com/api/mcp/asset/824fe277-8a8d-4f45-81c3-7aebf74c5e44"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const onChange = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (authError) {
    setError(authError.message)
    setLoading(false)
    return
  }

 
  window.location.href = '/'
}
  const onGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── KIRI: Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[480px] space-y-8">

          {/* Intro */}
          <div className="space-y-3">
            <h1 className="text-4xl font-['Poppins',sans-serif] font-semibold text-[#0c1421] tracking-tight">
              Selamat Datang 👋
            </h1>
            <p className="text-[#313957] text-xl font-['Poppins',sans-serif]">
              Mari berbuat baik bersama KajianQu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">Email</label>
              <input
                type="email"
                required
                placeholder="Masukkan Email"
                value={form.email}
                onChange={e => onChange('email', e.target.value)}
                className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 text-base text-[#0c1421] placeholder:text-[#8897ad] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Masukkan Password"
                  value={form.password}
                  onChange={e => onChange('password', e.target.value)}
                  className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 pr-12 text-base text-[#0c1421] placeholder:text-[#8897ad] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8897ad] hover:text-[#1a7a53] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-[#1e4ae9] text-base hover:underline">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#1a7a53] text-white text-xl font-['Roboto',sans-serif] rounded-xl hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Masuk...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#d4d7e3]" />
            <span className="text-[#294957] text-base">Or</span>
            <div className="flex-1 h-px bg-[#d4d7e3]" />
          </div>

          {/* Google */}
          <button
            onClick={onGoogle}
            className="w-full flex items-center justify-center gap-4 bg-[#effffe] border border-[#d4d7e3] rounded-xl py-3 hover:bg-[#e0faf9] transition-colors"
          >
            <img src={imgGoogle} alt="Google" className="w-7 h-7 object-contain" />
            <span className="text-[#313957] text-base font-['Roboto',sans-serif]">Sign in with Google</span>
          </button>

          {/* Register link */}
          <p className="text-center text-lg font-['Roboto',sans-serif]">
            <span className="text-[#313957]">Tidak Punya Akun? </span>
            <Link href="/role-select" className="text-[#1e4ae9] hover:underline font-medium">
              Daftar Disini
            </Link>
          </p>

        </div>
      </div>

      {/* ── KANAN: Art ── */}
      <div className="hidden lg:flex flex-1 items-stretch p-8">
        <div className="relative w-full rounded-[24px] overflow-hidden">
          <img src={imgLoginArt} alt="Art" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,61,42,0.17)] to-[rgba(26,122,83,0.33)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={imgLogo} alt="KajianQu" className="w-56 object-contain drop-shadow-2xl" />
          </div>
        </div>
      </div>

    </div>
  )
}