'use client'

import { useState } from 'react'
import { MateriService } from '@/lib/materi-service'
import { supabase } from '@/lib/supabase/client'
import { Send, Youtube, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function UploadMateriPage() {
  const [step, setStep]       = useState<'form' | 'status'>('form')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', subject: '', kitab: '', level: 'Mudah', youtube_url: '', description: ''
  })

  const handleUpload = async () => {
    if (!formData.title || !formData.youtube_url) {
      alert('Judul dan link YouTube wajib diisi')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await MateriService.uploadMaterial({
        asatidz_id:  user?.id,
        title:       formData.title,
        type:        'kajian_tematik',
        slug:        formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        youtube_url: formData.youtube_url,
        description: formData.description,
        summary:     formData.kitab,
        is_published: false,
      })
      setStep('status')
    } catch (err: any) {
      alert('Gagal upload: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[#064E3B] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Keilmuan › Upload</p>
          <h2 className="text-3xl font-black tracking-tighter">Upload Materi Baru</h2>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      </div>

      {step === 'form' ? (
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Mata Pelajaran" placeholder="Contoh: Akhlak"             value={formData.subject}     onChange={v => set('subject', v)} />
            <InputGroup label="Judul Materi"   placeholder="Contoh: Hukumnya Tahlilan"  value={formData.title}       onChange={v => set('title', v)} />
            <InputGroup label="Nama Kitab"     placeholder="Contoh: Safinatun Najah"    value={formData.kitab}       onChange={v => set('kitab', v)} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Level</label>
              <select
                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.level}
                onChange={e => set('level', e.target.value)}
              >
                {['Mudah', 'Menengah', 'Sulit', 'Sangat Sulit'].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link Youtube</label>
              <span className="text-[9px] font-bold text-gray-300 uppercase">Minimal 30 menit</span>
            </div>
            <div className="relative">
              <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="url"
                placeholder="https://youtube.com/..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.youtube_url}
                onChange={e => set('youtube_url', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Deskripsi</label>
            <textarea
              rows={4}
              placeholder="Deskripsi tentang materi..."
              className="w-full p-6 bg-gray-50 rounded-[32px] border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              value={formData.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-5 bg-[#064E3B] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-800 disabled:opacity-60 transition-all flex items-center justify-center gap-3"
          >
            {loading ? 'Mengirim...' : 'Kirim Sekarang'} <Send size={18} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-center gap-4 text-orange-700">
              <Clock className="animate-pulse shrink-0" />
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Menunggu Verifikasi</p>
                <p className="text-xs font-medium opacity-80">Pantau terus akun anda</p>
              </div>
            </div>

            <h4 className="font-black text-emerald-950 text-xl tracking-tighter mt-8">Riwayat Materi</h4>
            <div className="space-y-4">
              <HistoryItem title={formData.title || 'Materi Baru'} time="Baru saja"     status="pending" />
              <HistoryItem title="Keutamaan Bulan Ramadhan"        time="15 menit lalu" status="pending" />
              <HistoryItem title="Adab Bertetangga"                time="1 jam lalu"    status="verified" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-emerald-950 text-lg tracking-tighter">Detail Verifikasi</h4>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase">Pending</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Link Youtube</p>
                <a href={formData.youtube_url} target="_blank" rel="noreferrer" className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:underline truncate">
                  {formData.youtube_url || '—'} <ExternalLink size={10} />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <MiniStat label="Kitab"    val={formData.kitab   || '—'} />
                <MiniStat label="Pelajaran" val={formData.subject || '—'} />
                <MiniStat label="Level"    val={formData.level} />
              </div>
            </div>
            <Link
              href="/dashboard/asatidz/keilmuan"
              className="block w-full text-center py-3 bg-[#064E3B] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all"
            >
              Lihat Semua Materi
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function InputGroup({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function HistoryItem({ title, time, status }: { title: string; time: string; status: 'pending' | 'verified' }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-[32px] hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
          <Youtube size={20} />
        </div>
        <div>
          <h5 className="font-black text-emerald-950 text-sm">{title}</h5>
          <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">{time}</p>
        </div>
      </div>
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
        {status === 'pending' ? 'Menunggu' : 'Verified'}
      </span>
    </div>
  )
}

function MiniStat({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[10px] font-black text-emerald-950">{val}</p>
    </div>
  )
}