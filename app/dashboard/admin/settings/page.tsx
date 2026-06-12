import { createClient } from '@supabase/supabase-js'
import {
Settings,
Wallet,
Mail,
Phone,
Shield
} from 'lucide-react'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data: settings } = await supabaseAdmin
.from('settings')
.select('*')

const getValue = (key: string) =>
settings?.find(s => s.key === key)?.value || ''

return ( <div className="space-y-6">

  <div>
    <h1 className="text-2xl font-bold text-gray-800">
      Pengaturan Sistem
    </h1>
    <p className="text-gray-500">
      Kelola konfigurasi aplikasi KajianQu
    </p>
  </div>
{params.success && (
  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
    Pengaturan berhasil disimpan
  </div>
)}

{params.error && (
  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
    Terjadi kesalahan saat menyimpan pengaturan
  </div>
)}
  <form
    action="/api/admin/settings/save"
    method="POST"
    className="space-y-6"
  >

    {/* Donation */}
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={18} />
        <h2 className="font-bold">
          Pengaturan Donasi
        </h2>
        
      </div>
<p className="text-xs text-gray-500 mt-1">
  Target saat ini: Rp {Number(getValue('donation_target') || 0).toLocaleString('id-ID')}
</p>
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Donasi Bulanan
          </label>

          <input
            type="number"
            name="donation_target"
            defaultValue={getValue('donation_target')}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Donasi Aktif
          </label>

          <select
            name="donation_enabled"
            defaultValue={getValue('donation_enabled')}
            className="w-full border rounded-lg p-3"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

      </div>
    </div>

    {/* Support */}
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone size={18} />
        <h2 className="font-bold">
          Support
        </h2>
      </div>

      <div className="space-y-4">

        <input
          type="text"
          name="support_whatsapp"
          defaultValue={getValue('support_whatsapp')}
          placeholder="Nomor WhatsApp"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="email"
          name="support_email"
          defaultValue={getValue('support_email')}
          placeholder="Email Support"
          className="w-full border rounded-lg p-3"
        />

      </div>
    </div>

{/* System */}
<div className="bg-white rounded-xl border p-6">
  <div className="flex items-center gap-2 mb-4">
    <Shield size={18} />
    <h2 className="font-bold">
      Pengaturan Sistem
    </h2>
  </div>

  <div className="space-y-4">

    <div>
      <label className="block text-sm font-medium mb-1">
        Status Pendaftaran Asatidz
      </label>

      <select
        name="asatidz_registration"
        defaultValue={getValue('asatidz_registration')}
        className="w-full border rounded-lg p-3"
      >
        <option value="true">
          Dibuka
        </option>

        <option value="false">
          Ditutup
        </option>
      </select>

      <p className="text-xs text-gray-500 mt-1">
        Saat ini: {
          getValue('asatidz_registration') === 'true'
            ? 'Dibuka'
            : 'Ditutup'
        }
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Status Donasi
      </label>

      <select
        name="donation_enabled"
        defaultValue={getValue('donation_enabled')}
        className="w-full border rounded-lg p-3"
      >
        <option value="true">
          Aktif
        </option>

        <option value="false">
          Nonaktif
        </option>
      </select>

      <p className="text-xs text-gray-500 mt-1">
        Saat ini: {
          getValue('donation_enabled') === 'true'
            ? 'Aktif'
            : 'Nonaktif'
        }
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Maintenance Mode
      </label>

      <select
        name="maintenance_mode"
        defaultValue={getValue('maintenance_mode')}
        className="w-full border rounded-lg p-3"
      >
        <option value="false">
          OFF
        </option>

        <option value="true">
          ON
        </option>
      </select>

      <p className="text-xs text-gray-500 mt-1">
        Saat ini: {
          getValue('maintenance_mode') === 'true'
            ? 'ON'
            : 'OFF'
        }
      </p>
    </div>

  </div>
</div>

    <button
      type="submit"
      className="bg-[#064E3B] text-white px-5 py-3 rounded-lg font-semibold"
    >
      Simpan Pengaturan
    </button>

  </form>

</div>

)
}
