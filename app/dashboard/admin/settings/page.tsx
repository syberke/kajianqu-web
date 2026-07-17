import { Mail, Phone, Settings, Shield, Wallet } from 'lucide-react'

import { db } from '@/lib/db'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const settings = await db.setting.findMany()
  const values = new Map(settings.map((setting) => [setting.key, setting.value]))
  const getValue = (key: string, fallback = '') => values.get(key) ?? fallback

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-[#064E3B]"><Settings size={21} /></span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500">Kelola konfigurasi KajianQu dari satu tempat.</p>
        </div>
      </div>

      {params.success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">Pengaturan berhasil disimpan.</div>}
      {params.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Terjadi kesalahan saat menyimpan pengaturan.</div>}

      <form action="/api/admin/settings/save" method="POST" className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2"><Wallet size={18} className="text-[#064E3B]" /><h2 className="font-bold text-slate-900">Donasi</h2></div>
          <label className="block text-sm font-medium text-slate-700">
            Target donasi bulanan
            <input type="number" min="0" name="donation_target" defaultValue={getValue('donation_target', '0')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
          </label>
          <p className="mt-2 text-xs text-slate-500">Target saat ini: Rp {Number(getValue('donation_target', '0')).toLocaleString('id-ID')}</p>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            Status donasi
            <select name="donation_enabled" defaultValue={getValue('donation_enabled', 'true')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4">
              <option value="true">Aktif</option><option value="false">Nonaktif</option>
            </select>
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2"><Phone size={18} className="text-[#064E3B]" /><h2 className="font-bold text-slate-900">Support</h2></div>
          <label className="block text-sm font-medium text-slate-700">
            Nomor WhatsApp
            <input type="text" name="support_whatsapp" defaultValue={getValue('support_whatsapp')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
          </label>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2"><Mail size={15} /> Email support</span>
            <input type="email" name="support_email" defaultValue={getValue('support_email')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500" />
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-2"><Shield size={18} className="text-[#064E3B]" /><h2 className="font-bold text-slate-900">Status sistem</h2></div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">Pendaftaran asatidz
              <select name="asatidz_registration" defaultValue={getValue('asatidz_registration', 'true')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4">
                <option value="true">Dibuka</option><option value="false">Ditutup</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Maintenance mode
              <select name="maintenance_mode" defaultValue={getValue('maintenance_mode', 'false')} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4">
                <option value="false">OFF</option><option value="true">ON</option>
              </select>
            </label>
          </div>
        </section>

        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" className="rounded-xl bg-[#064E3B] px-6 py-3 font-semibold text-white transition hover:bg-[#043f30]">Simpan Pengaturan</button>
        </div>
      </form>
    </div>
  )
}
