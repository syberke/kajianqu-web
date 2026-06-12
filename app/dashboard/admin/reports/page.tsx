import { createClient } from '@supabase/supabase-js'
import {
Users,
Wallet,
BookOpen,
Radio
} from 'lucide-react'

export default async function ReportsPage() {
const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { count: totalAsatidz } = await supabaseAdmin
.from('profiles')
.select('*', {
count: 'exact',
head: true
})
.eq('role', 'asatidz')

const { count: totalMateri } = await supabaseAdmin
.from('materials')
.select('*', {
count: 'exact',
head: true
})

const { count: totalLive } = await supabaseAdmin
.from('live_sessions')
.select('*', {
count: 'exact',
head: true
})

const { data: donations } = await supabaseAdmin
.from('donations')
.select('nominal')
.eq('payment_status', 'paid')

const totalDonasi =
donations?.reduce(
(sum, item) =>
sum + Number(item.nominal),
0
) || 0
const { count: totalUsers } = await supabaseAdmin
  .from('profiles')
  .select('*', {
    count: 'exact',
    head: true
  })
return ( <div className="space-y-6">

  <div>
    <h1 className="text-2xl font-bold">
      Laporan Sistem
    </h1>
    <p className="text-gray-500">
      Ringkasan seluruh aktivitas KajianQu
    </p>
  </div>

  <div className="grid md:grid-cols-4 gap-4">

    <ReportCard
      icon={<Users />}
      title="Asatidz"
      value={totalAsatidz || 0}
    />
<ReportCard
  icon={<Users />}
  title="User"
  value={totalUsers || 0}
/>
    <ReportCard
      icon={<Wallet />}
      title="Total Donasi"
      value={`Rp ${totalDonasi.toLocaleString('id-ID')}`}
    />

    <ReportCard
      icon={<BookOpen />}
      title="Materi"
      value={totalMateri || 0}
    />

    <ReportCard
      icon={<Radio />}
      title="Live Session"
      value={totalLive || 0}
    />

  </div>
  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">

  <a
    href="/api/admin/reports/asatidz"
    className="bg-green-600 text-white px-4 py-3 rounded-xl text-center"
  >
    Export Asatidz
  </a>

  <a
    href="/api/admin/reports/donasi"
    className="bg-blue-600 text-white px-4 py-3 rounded-xl text-center"
  >
    Export Donasi
  </a>

  <a
    href="/api/admin/reports/materi"
    className="bg-orange-600 text-white px-4 py-3 rounded-xl text-center"
  >
    Export Materi
  </a>

  <a
    href="/api/admin/reports/live"
    className="bg-red-600 text-white px-4 py-3 rounded-xl text-center"
  >
    Export Live
  </a>

  <a
    href="/api/admin/reports/users"
    className="bg-purple-600 text-white px-4 py-3 rounded-xl text-center"
  >
    Export User
  </a>

</div>
</div>

)
}

function ReportCard({
icon,
title,
value
}: any) {
return ( <div className="bg-white border rounded-xl p-5"> <div className="mb-3">
{icon} </div>
  <p className="text-sm text-gray-500">
    {title}
  </p>

  <h2 className="text-2xl font-bold">
    {value}
  </h2>
</div>


)
}
