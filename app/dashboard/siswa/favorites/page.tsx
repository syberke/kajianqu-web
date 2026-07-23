import Link from 'next/link'
import { Bookmark, BookOpen, UserRound } from 'lucide-react'

import RemoveSavedButton from '@/components/saved/RemoveSavedButton'
import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function StudentFavoritesPage() {
  const user = await getAuthenticatedUser()
  const items = user ? await db.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      asatidz: { select: { id: true, nama: true, fotoUrl: true, asatidzProfile: { select: { bidang: true } } } },
      privateClass: { select: { id: true, title: true, description: true, coverUrl: true } },
      material: { select: { id: true, title: true, summary: true, thumbnailUrl: true } },
    },
  }) : []

  return <section><div className="mb-7"><h1 className="text-3xl font-black text-slate-900">Tersimpan</h1><p className="mt-1 text-sm text-slate-500">Ustadz, kelas, dan materi yang ingin Anda buka lagi.</p></div>{items.length === 0 ? <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-500"><Bookmark className="mx-auto mb-3 text-slate-300" size={42} />Belum ada item tersimpan.<div><Link href="/ustadz" className="mt-4 inline-flex font-black text-emerald-700 hover:underline">Jelajahi daftar ustadz</Link></div></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const data = item.asatidz ? { title: item.asatidz.nama, description: item.asatidz.asatidzProfile?.bidang || 'Ustadz KajianQu', image: item.asatidz.fotoUrl, href: `/ustadz/${item.asatidz.id}`, type: 'asatidz' as const, id: item.asatidz.id, icon: UserRound } : item.privateClass ? { title: item.privateClass.title, description: item.privateClass.description || 'Kelas private', image: item.privateClass.coverUrl, href: '/kelas#private', type: 'privateClass' as const, id: item.privateClass.id, icon: BookOpen } : item.material ? { title: item.material.title, description: item.material.summary || 'Materi KajianQu', image: item.material.thumbnailUrl, href: `/keilmuan/${item.material.id}`, type: 'material' as const, id: item.material.id, icon: BookOpen } : null; if (!data) return null; const Icon = data.icon; return <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><Link href={data.href}><div className="grid h-36 place-items-center overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-600 text-emerald-100">{data.image ? <img src={data.image} alt="" className="h-full w-full object-cover" /> : <Icon size={38} />}</div><div className="px-5 pt-5"><h2 className="font-black text-slate-900">{data.title}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-500">{data.description}</p></div></Link><div className="flex justify-end p-5"><RemoveSavedButton targetType={data.type} targetId={data.id} /></div></article> })}</div>}</section>
}
