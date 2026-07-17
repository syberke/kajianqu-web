import Link from 'next/link'
import { BookOpen, CalendarDays, ChevronRight, MessageCircle, Plus, Users, Video } from 'lucide-react'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function AsatidzDashboardPage() {
  const { user, profile } = await requireRole('asatidz')
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const [materials, enrollments, incomingMessages, liveToday, upcomingLive, recentMessages] = await Promise.all([
    db.material.count({ where: { asatidzId: user.id } }),
    db.privateClassEnrollment.findMany({
      where: { material: { asatidzId: user.id } },
      select: { studentId: true },
    }),
    db.message.count({ where: { receiverId: user.id } }),
    db.liveSession.count({
      where: { asatidzId: user.id, scheduledAt: { gte: startOfDay, lt: endOfDay } },
    }),
    db.liveSession.findMany({
      where: { asatidzId: user.id, scheduledAt: { gte: now } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    db.message.findMany({
      where: { receiverId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { sender: { select: { nama: true } } },
    }),
  ])

  const activeStudents = new Set(enrollments.map((item) => item.studentId)).size
  const firstName = profile?.nama?.trim().split(/\s+/)[0] || 'Ustadz'

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[40px] bg-[#064E3B] p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Dashboard Asatidz</p>
            <h1 className="text-3xl font-black">Ahlan wa Sahlan, {firstName}!</h1>
            <p className="font-medium text-emerald-100/60">Ringkasan diambil dari materi, enrollment, pesan, dan jadwal live Anda.</p>
          </div>
          <Link href="/dashboard/asatidz/keilmuan/new" className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-[#064E3B] transition hover:bg-emerald-50">
            <Plus size={20} strokeWidth={3} /> Buat Kajian Baru
          </Link>
        </div>
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Santri Aktif" value={activeStudents} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Total Materi" value={materials} icon={<BookOpen className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Pesan Masuk" value={incomingMessages} icon={<MessageCircle className="text-violet-600" />} color="bg-violet-50" />
        <StatCard label="Jadwal Hari Ini" value={liveToday} icon={<CalendarDays className="text-orange-600" />} color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-emerald-950">Jadwal Live Mendatang</h2>
              <p className="mt-1 text-sm text-gray-400">Sesi live dari database.</p>
            </div>
            <Link href="/dashboard/asatidz/live" className="text-xs font-bold uppercase tracking-widest text-emerald-600">Lihat Semua</Link>
          </div>
          {upcomingLive.length === 0 ? (
            <p className="rounded-3xl bg-gray-50 py-14 text-center text-sm font-medium text-gray-400">Belum ada live session mendatang.</p>
          ) : (
            <div className="space-y-3">
              {upcomingLive.map((item) => (
                <article key={item.id} className="flex items-center justify-between rounded-3xl border border-transparent p-4 transition hover:border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Video size={20} /></div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950">{item.title}</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase text-gray-400">{item.scheduledAt ? item.scheduledAt.toLocaleString('id-ID') : 'Jadwal belum ditentukan'}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-emerald-950">Pesan Santri</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">{incomingMessages} PESAN</span>
          </div>
          {recentMessages.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-12 text-center text-sm text-gray-400">Belum ada pesan masuk.</p>
          ) : (
            <div className="flex-1 space-y-5">
              {recentMessages.map((message) => {
                const name = message.sender.nama || 'Santri KajianQu'
                return (
                  <div key={message.id} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#064E3B] text-sm font-black text-white">{name[0]}</div>
                    <div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h3 className="truncate text-sm font-black text-emerald-950">{name}</h3><span className="shrink-0 text-[10px] font-bold text-gray-300">{message.createdAt.toLocaleDateString('id-ID')}</span></div><p className="mt-1 truncate text-xs font-medium text-gray-400">{message.content}</p></div>
                  </div>
                )
              })}
            </div>
          )}
          <Link href="/dashboard/asatidz/chat" className="mt-8 block rounded-2xl bg-emerald-50 px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-emerald-700">Buka Semua Pesan</Link>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return <article className="space-y-3 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>{icon}</div><div><p className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-gray-400">{label}</p><p className="text-2xl font-black text-emerald-950">{value}</p></div></article>
}
