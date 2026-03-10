'use client'

import { useState } from 'react'

type Role = 'siswa' | 'asatidz'

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('siswa')
  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_wa: '',
    password: '',
    bidang: '',
    bank: '',
    no_rekening: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setMessage('')

  try {
    const endpoint =
      role === 'siswa'
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-siswa`
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-asatidz`

    console.log('ENDPOINT:', endpoint)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        ...form,
      }),
    })

    const text = await res.text()
    console.log('RAW RESPONSE:', text)

    let result: any = {}
    try {
      result = JSON.parse(text)
    } catch {
      result = { error: text }
    }

    if (!res.ok) {
      setMessage(result.error || 'Gagal register')
      return
    }

    setMessage('Register berhasil. Silakan login.')
  } catch (error) {
    console.error('REGISTER ERROR:', error)
    setMessage('Tidak bisa terhubung ke server register')
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border p-6">
        <h1 className="text-2xl font-bold">Register</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole('siswa')}
            className={`px-4 py-2 rounded ${role === 'siswa' ? 'bg-black text-white' : 'border'}`}
          >
            Siswa
          </button>
          <button
            type="button"
            onClick={() => setRole('asatidz')}
            className={`px-4 py-2 rounded ${role === 'asatidz' ? 'bg-black text-white' : 'border'}`}
          >
            Asatidz
          </button>
        </div>

        <input className="w-full border rounded p-3" placeholder="Nama" value={form.nama} onChange={(e) => onChange('nama', e.target.value)} />
        <input className="w-full border rounded p-3" placeholder="Email" type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        <input className="w-full border rounded p-3" placeholder="No WhatsApp" value={form.no_wa} onChange={(e) => onChange('no_wa', e.target.value)} />
        <input className="w-full border rounded p-3" placeholder="Password" type="password" value={form.password} onChange={(e) => onChange('password', e.target.value)} />

        {role === 'asatidz' && (
          <>
            <input className="w-full border rounded p-3" placeholder="Bidang" value={form.bidang} onChange={(e) => onChange('bidang', e.target.value)} />
            <input className="w-full border rounded p-3" placeholder="Bank" value={form.bank} onChange={(e) => onChange('bank', e.target.value)} />
            <input className="w-full border rounded p-3" placeholder="No Rekening" value={form.no_rekening} onChange={(e) => onChange('no_rekening', e.target.value)} />
          </>
        )}

        <button disabled={loading} className="w-full rounded bg-black text-white p-3">
          {loading ? 'Loading...' : 'Daftar'}
        </button>

        {message && <p className="text-sm text-center">{message}</p>}
      </form>
    </main>
  )
}


