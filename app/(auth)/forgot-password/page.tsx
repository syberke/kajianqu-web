'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (resetError) setError(resetError.message)
    else setMessage('Tautan pemulihan telah dikirim. Silakan periksa email Anda.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] px-6 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[28px] bg-white border border-emerald-950/10 p-8 shadow-xl shadow-emerald-950/5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#157a52] flex items-center justify-center mb-6">
          <Mail size={26} />
        </div>
        <h1 className="text-3xl font-bold text-[#0c2e1c]">Lupa password?</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Masukkan email akun KajianQu. Kami akan mengirimkan tautan untuk membuat password baru.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-[#0c2e1c]" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-[#157a52] focus:ring-4 focus:ring-[#157a52]/10" />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
          <button disabled={loading} className="w-full h-12 rounded-xl bg-[#157a52] text-white font-semibold hover:bg-[#0c2e1c] disabled:opacity-60 transition-colors">
            {loading ? 'Mengirim...' : 'Kirim tautan pemulihan'}
          </button>
        </form>

        <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#157a52] hover:underline">
          <ArrowLeft size={16} /> Kembali ke halaman masuk
        </Link>
      </section>
    </main>
  )
}
