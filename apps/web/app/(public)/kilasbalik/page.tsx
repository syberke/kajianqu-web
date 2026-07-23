import { CalendarDays, History, UserRound } from 'lucide-react'

import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function KilasBalikPage() {
  const items = await db.retrospective.findMany({
    where: { isPublished: true },
    orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
    take: 60,
    include: {
      asatidz: {
        select: {
          title: true,
          latarBelakang: true,
          bio: true,
          profile: { select: { nama: true, fotoUrl: true } },
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-[#f5faf8] pt-[72px]">
      <section className="bg-[#064E3B] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">Jejak KajianQu</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Kilas balik perjalanan ilmu dan para asatidz</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/70 sm:text-base">
            Dokumentasi kajian, profil singkat pengajar, dan momen penting yang telah membersamai perjalanan umat.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-20 text-center">
            <History className="mx-auto text-emerald-700" size={42} />
            <h2 className="mt-4 text-xl font-black text-slate-900">Kilas balik sedang disiapkan</h2>
            <p className="mt-2 text-sm text-slate-500">Dokumentasi yang telah diverifikasi admin akan tampil di halaman ini.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => {
              const teacherName = item.asatidz?.profile.nama ?? 'Asatidz KajianQu'
              const displayName = [item.asatidz?.title, teacherName].filter(Boolean).join(' ')
              return (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-600 sm:h-64">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-emerald-100"><History size={54} /></div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-white">
                      <h2 className="text-xl font-black sm:text-2xl">{item.title}</h2>
                      {item.eventDate && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-white/80">
                          <CalendarDays size={14} />
                          {item.eventDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-emerald-50">
                        {item.asatidz?.profile.fotoUrl ? (
                          <img src={item.asatidz.profile.fotoUrl} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-emerald-700"><UserRound size={25} /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900">{displayName}</p>
                        {item.asatidz?.latarBelakang && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.asatidz.latarBelakang}</p>}
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                      {item.summary || item.asatidz?.bio || 'Dokumentasi perjalanan kajian bersama KajianQu.'}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
