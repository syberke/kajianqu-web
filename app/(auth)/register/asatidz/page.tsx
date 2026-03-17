'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

const imgLoginArt = "https://www.figma.com/api/mcp/asset/1a24b781-4731-4611-b596-24fd10d1c517"
const imgLogo     = "https://res.cloudinary.com/dyyvn5vla/image/upload/v1773101077/Logo_Bg_White-removebg-preview_wyr999.png"

const BANKS       = ['BCA','BNI','BRI','Mandiri','BSI','CIMB Niaga','Permata','Danamon','Lainnya']
const BIDANG_LIST = ['Tahfidz','Tajwid','Fiqih','Akhlak','Akidah','Tafsir','Hadits','Lainnya']

export default function RegisterAsatidzPage() {
  const [form, setForm] = useState({ nama: '', email: '', no_wa: '', password: '', bidang: '', bank: '', no_rekening: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [message, setMessage]     = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const onChange = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-asatidz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
          body: JSON.stringify(form),
        }
      )
      const text = await res.text()
      let result: any = {}
      try { result = JSON.parse(text) } catch { result = { error: text } }
      if (!res.ok) { setMessage(result.error || 'Gagal mendaftar'); return }
      setIsSuccess(true)
    } catch {
      setMessage('Tidak bisa terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-[#1a7a53]" />
          </div>
          <h2 className="text-3xl font-semibold font-['Poppins',sans-serif] text-[#0c1421]">Pendaftaran Berhasil!</h2>
          <p className="text-[#313957] text-lg">Silakan cek email untuk verifikasi. Akun akan diaktifkan setelah diverifikasi admin.</p>
          <Link href="/login" className="block w-full bg-[#1a7a53] text-white text-lg text-center py-4 rounded-xl hover:bg-[#15613f] transition-colors">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── KIRI: Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] space-y-8 py-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-['Poppins',sans-serif] font-semibold text-[#0c1421] tracking-tight">Daftar Asatidz 🎓</h1>
            <p className="text-[#313957] text-xl font-['Poppins',sans-serif]">Bagikan ilmu dan berkah kepada santri di seluruh dunia</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Data Pribadi */}
            <Field label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={form.nama} onChange={v => onChange('nama', v)} required />
            <Field label="Email" type="email" placeholder="Masukkan email" value={form.email} onChange={v => onChange('email', v)} required />
            <Field label="No. WhatsApp" placeholder="Contoh: 08123456789" value={form.no_wa} onChange={v => onChange('no_wa', v)} required />

            <div className="space-y-2">
              <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required minLength={8}
                  placeholder="Min. 8 karakter" value={form.password}
                  onChange={e => onChange('password', e.target.value)}
                  className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 pr-12 text-base text-[#0c1421] placeholder:text-[#8897ad] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8897ad] hover:text-[#1a7a53]">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Divider — Data Asatidz */}
            <div className="pt-1 pb-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#d4d7e3]" />
                <span className="text-[#1a7a53] text-sm font-semibold font-['Poppins',sans-serif] uppercase tracking-widest whitespace-nowrap">Data Asatidz</span>
                <div className="flex-1 h-px bg-[#d4d7e3]" />
              </div>
            </div>

            {/* Bidang */}
            <div className="space-y-2">
              <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">Bidang Mengajar</label>
              <select required value={form.bidang} onChange={e => onChange('bidang', e.target.value)}
                className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 text-base text-[#0c1421] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
              >
                <option value="" disabled>Pilih bidang</option>
                {BIDANG_LIST.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Bank */}
            <div className="space-y-2">
              <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">Bank</label>
              <select required value={form.bank} onChange={e => onChange('bank', e.target.value)}
                className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 text-base text-[#0c1421] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
              >
                <option value="" disabled>Pilih bank</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <Field label="Nomor Rekening" placeholder="Masukkan nomor rekening" value={form.no_rekening} onChange={v => onChange('no_rekening', v)} required />

            {message && <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-xl">{message}</p>}

            <button type="submit" disabled={loading} className="w-full h-14 bg-[#1a7a53] text-white text-xl font-['Roboto',sans-serif] rounded-xl hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-lg font-['Roboto',sans-serif]">
            <span className="text-[#313957]">Sudah Punya Akun? </span>
            <Link href="/login" className="text-[#1e4ae9] hover:underline font-medium">Masuk Disini</Link>
          </p>
        </div>
      </div>

      {/* ── KANAN: Art ── */}
      <div className="hidden lg:flex flex-1 items-stretch p-8 sticky top-0 h-screen">
        <div className="relative w-full rounded-[24px] overflow-hidden">
          <img src={imgLoginArt} alt="Art" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(13,61,42,0.17)] to-[rgba(26,122,83,0.33)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <img src={imgLogo} alt="KajianQu" className="w-56 object-contain drop-shadow-2xl" />
            <p className="text-white/80 text-lg font-['Poppins',sans-serif]">Bagikan ilmu dan berkah kepada santri di seluruh dunia</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', required = false }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-[#0c1421] text-base font-['Roboto',sans-serif]">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-12 bg-[#f7fbff] border border-[#d4d7e3] rounded-xl px-4 text-base text-[#0c1421] placeholder:text-[#8897ad] focus:outline-none focus:border-[#1a7a53] focus:ring-2 focus:ring-[#1a7a53]/20 transition-all"
      />
    </div>
  )
}