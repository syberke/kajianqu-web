'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Award, LoaderCircle, Plus, UserRoundCheck } from 'lucide-react'

interface UserOption { id: string; nama: string; role: string }
interface AchievementItem {
  id: string
  code: string
  title: string
  description: string
  icon: string | null
  targetRole: string | null
  awards: Array<{ userId: string; awardedAt: string; user: UserOption }>
}

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<AchievementItem[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedAchievement, setSelectedAchievement] = useState('')
  const [selectedUser, setSelectedUser] = useState('')

  const load = async () => {
    const response = await fetch('/api/admin/achievements')
    const payload = (await response.json().catch(() => null)) as { achievements?: AchievementItem[]; users?: UserOption[]; error?: string } | null
    if (!response.ok) throw new Error(payload?.error || 'Gagal memuat achievement.')
    setItems(payload?.achievements ?? [])
    setUsers(payload?.users ?? [])
    setSelectedAchievement((current) => current || payload?.achievements?.[0]?.id || '')
    setSelectedUser((current) => current || payload?.users?.[0]?.id || '')
    setLoading(false)
  }

  useEffect(() => { void load().catch((cause) => { setError(cause instanceof Error ? cause.message : 'Gagal memuat data.'); setLoading(false) }) }, [])

  const submit = async (body: object) => {
    setSaving(true)
    setError('')
    const response = await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error || 'Permintaan gagal.')
    else await load()
    setSaving(false)
  }

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    await submit({
      action: 'create',
      code: data.get('code'),
      title: data.get('title'),
      description: data.get('description'),
      icon: data.get('icon'),
      targetRole: data.get('targetRole') || null,
    })
    event.currentTarget.reset()
  }

  const selected = items.find((item) => item.id === selectedAchievement)
  const availableUsers = users.filter((user) => !selected?.targetRole || user.role === selected.targetRole)

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black text-slate-900">Achievement Pengguna</h1><p className="mt-1 text-sm text-slate-500">Buat tag pencapaian dan berikan kepada siswa, asatidz, atau admin tanpa membuka alamat email mereka.</p></div>
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={create} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Plus size={20} /></span><div><h2 className="font-black text-slate-900">Buat achievement</h2><p className="text-xs text-slate-500">Role target dapat dikosongkan untuk semua pengguna.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><input required name="code" placeholder="Kode: HAFIZ_1" className="h-12 rounded-xl border border-slate-200 px-4" /><input name="icon" placeholder="Ikon/emoji: 🏆" className="h-12 rounded-xl border border-slate-200 px-4" /></div>
          <input required name="title" placeholder="Nama achievement" className="h-12 w-full rounded-xl border border-slate-200 px-4" />
          <textarea required name="description" rows={3} placeholder="Deskripsi pencapaian" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
          <select name="targetRole" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="">Semua role</option><option value="siswa">Siswa</option><option value="asatidz">Asatidz</option><option value="admin">Admin</option></select>
          <button disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Award size={18} />} Simpan achievement</button>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); void submit({ action: 'award', userId: selectedUser, achievementId: selectedAchievement, evidence: new FormData(event.currentTarget).get('evidence') }) }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-700"><UserRoundCheck size={20} /></span><div><h2 className="font-black text-slate-900">Berikan achievement</h2><p className="text-xs text-slate-500">Penetapan dicatat dengan admin pemberi dan waktu.</p></div></div>
          <select required value={selectedAchievement} onChange={(event) => { setSelectedAchievement(event.target.value); setSelectedUser('') }} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="">Pilih achievement</option>{items.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.targetRole || 'semua'}</option>)}</select>
          <select required value={selectedUser} onChange={(event) => setSelectedUser(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="">Pilih pengguna</option>{availableUsers.map((user) => <option key={user.id} value={user.id}>{user.nama} · {user.role}</option>)}</select>
          <textarea name="evidence" rows={3} placeholder="Catatan atau bukti pencapaian (opsional)" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
          <button disabled={saving || !selectedUser || !selectedAchievement} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D3AD0F] font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Award size={18} />} Berikan ke pengguna</button>
        </form>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-black text-slate-900">Daftar tag dan penerima</h2>
        {loading ? <div className="grid h-40 place-items-center"><LoaderCircle className="animate-spin text-emerald-700" /></div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-100 p-5"><div className="flex gap-3"><span className="text-2xl">{item.icon || '🏆'}</span><div><p className="font-black text-slate-900">{item.title}</p><p className="text-xs font-bold uppercase text-emerald-700">{item.code} · {item.targetRole || 'semua role'}</p></div></div><p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p><div className="mt-3 flex flex-wrap gap-2">{item.awards.length === 0 ? <span className="text-xs text-slate-400">Belum diberikan</span> : item.awards.slice(0, 10).map((award) => <span key={award.userId} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{award.user.nama} · {award.user.role}</span>)}</div></article>)}</div>}
      </section>
    </div>
  )
}
