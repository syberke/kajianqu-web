import Link from 'next/link'
import { CalendarClock, ExternalLink, MessageSquare, Users } from 'lucide-react'

import { db } from '@/lib/db'
import { requireRole } from '@/lib/helpers/auth'

export default async function StudentClassesPage() {
  const { user } = await requireRole('siswa')
  const memberships = await db.classMember.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  const classIds = memberships.map((membership) => membership.classId)
  const [classes, sessions, rooms] = await Promise.all([
    classIds.length ? db.privateClass.findMany({ where: { id: { in: classIds } } }) : [],
    classIds.length ? db.classSession.findMany({ where: { classId: { in: classIds } }, orderBy: { startsAt: 'asc' } }) : [],
    classIds.length ? db.chatRoom.findMany({ where: { classId: { in: classIds }, roomType: 'class' } }) : [],
  ])
  const classMap = new Map(classes.map((item) => [item.id, item]))

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Belajar</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Kelas Saya</h1>
        <p className="mt-2 text-sm text-white/65">Jadwal, Zoom, passcode, dan chat grup hanya muncul setelah pendaftaran disetujui Asatidz.</p>
      </section>

      {memberships.length === 0 ? (
        <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <Users className="mx-auto text-slate-300" size={42} />
          <h2 className="mt-4 font-black text-slate-800">Belum mengikuti kelas</h2>
          <p className="mt-2 text-sm text-slate-500">Pilih kelas private yang sesuai dengan kebutuhan belajar Anda.</p>
          <Link href="/kelas" className="mt-5 inline-flex rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-black text-white">Cari Kelas</Link>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {memberships.map((membership) => {
            const item = classMap.get(membership.classId)
            if (!item) return null
            const active = membership.status === 'active'
            const session = sessions.find((value) => value.classId === item.id && value.startsAt >= new Date())
              ?? sessions.find((value) => value.classId === item.id)
            const room = rooms.find((value) => value.classId === item.id)
            return (
              <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div><span className={`rounded-full px-3 py-1 text-xs font-black ${active ? 'bg-emerald-50 text-emerald-700' : membership.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{membership.status}</span><h2 className="mt-3 text-lg font-black text-slate-900">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{item.description}</p></div>
                  <CalendarClock className="shrink-0 text-emerald-700" />
                </div>

                {active && session && (
                  <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                    <Detail label="Pertemuan" value={session.title} />
                    <Detail label="Jadwal" value={session.startsAt.toLocaleString('id-ID')} />
                    <Detail label="Meeting ID" value={session.meetingId || '-'} />
                    <Detail label="Passcode" value={session.passcode || '-'} />
                  </div>
                )}

                {active && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {room && <Link href={`/chat/class/${room.id}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"><MessageSquare size={16} /> Chat Grup</Link>}
                    {session?.meetingUrl && <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-emerald-700">Buka Zoom <ExternalLink size={16} /></a>}
                  </div>
                )}
                {!active && <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{membership.status === 'rejected' ? 'Pendaftaran belum diterima. Silakan pilih kelas lain atau hubungi Asatidz.' : 'Menunggu persetujuan Asatidz. Detail Zoom dan chat belum dapat diakses.'}</p>}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-700">{value}</p></div>
}
