'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password minimal terdiri dari 8 karakter.')
      return
    }

    if (password !== confirmation) {
      setError('Konfirmasi password belum sama.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.replace('/login?reset=success')
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] px-6 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[28px] bg-white border border-emerald-950/10 p-8 shadow-xl shadow-emerald-950/5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#157a52] flex items-center justify-center mb-6">
          <KeyRound size={26} />
        </div>
        <h1 className="text-3xl font-bold text-[#0c2e1c]">Buat password baru</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Gunakan password yang kuat dan belum pernah dipakai untuk akun ini.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-[#0c2e1c]" htmlFor="password">Password baru</label>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 outline-none focus:border-[#157a52] focus:ring-4 focus:ring-[#157a52]/10" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#157a52]">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="block text-sm font-semibold text-[#0c2e1c]" htmlFor="confirmation">Ulangi password</label>
          <input id="confirmation" type={showPassword ? 'text' : 'password'} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-[#157a52] focus:ring-4 focus:ring-[#157a52]/10" />

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full h-12 rounded-xl bg-[#157a52] text-white font-semibold hover:bg-[#0c2e1c] disabled:opacity-60 transition-colors">
            {loading ? 'Menyimpan...' : 'Simpan password baru'}
          </button>
        </form>

        <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-[#157a52] hover:underline">Kembali ke halaman masuk</Link>
      </section>
    </main>
  )
}
