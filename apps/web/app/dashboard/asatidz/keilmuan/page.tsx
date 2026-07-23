'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import { MateriService, type AsatidzMaterial } from '../../../../service/materi'

export default function ManajemenMateriAsatidz() {
  const [materials, setMaterials] = useState<AsatidzMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const data = await MateriService.getAsatidzMaterials()
        if (!cancelled) setMaterials(data)
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Gagal memuat materi')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (material: AsatidzMaterial) => {
    const confirmed = window.confirm(`Hapus materi “${material.title}”? Tindakan ini tidak bisa dibatalkan.`)
    if (!confirmed) return

    setDeletingId(material.id)
    setErrorMessage('')
    try {
      await MateriService.deleteMaterial(material.id)
      setMaterials((items) => items.filter((item) => item.id !== material.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal menghapus materi')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMaterials = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return materials

    return materials.filter((material) =>
      `${material.title} ${material.summary ?? ''} ${material.keilmuan?.nama ?? ''}`
        .toLowerCase()
        .includes(query),
    )
  }, [materials, searchTerm])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#064E3B] p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">Ruang Asatidz</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Manajemen Materi</h1>
            <p className="mt-2 text-sm text-emerald-100/70">Buat dan kelola materi kajian yang terhubung ke akun Asatidz Anda.</p>
          </div>
          <Link
            href="/dashboard/asatidz/keilmuan/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-[#1D794E] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600"
          >
            <Plus size={18} /> Buat Materi Baru
          </Link>
        </div>
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/5 blur-xl" />
      </section>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black text-emerald-950">Riwayat Materi</h2>
            <p className="mt-1 text-sm text-slate-500">{materials.length} materi tersimpan di akun Anda.</p>
          </div>
          <label className="relative block w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="search"
              placeholder="Cari judul, ringkasan, bidang..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-4 text-sm font-semibold text-slate-500">Memuat materi...</p>
            </div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="my-6 rounded-3xl border-2 border-dashed border-slate-200 px-6 py-16 text-center">
            <BookOpen size={42} className="mx-auto text-slate-300" />
            <p className="mt-4 font-bold text-slate-700">{searchTerm ? 'Materi tidak ditemukan' : 'Belum ada materi'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm ? 'Coba gunakan kata kunci lain.' : 'Mulai dengan membuat materi pertama Anda.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-4">Bidang</th>
                  <th className="px-3 py-4">Materi</th>
                  <th className="px-3 py-4">Dibuat</th>
                  <th className="px-3 py-4 text-center">Status</th>
                  <th className="px-3 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="group transition hover:bg-emerald-50/40">
                    <td className="px-3 py-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {material.keilmuan?.nama ?? 'Belum dikategorikan'}
                      </span>
                    </td>
                    <td className="max-w-sm px-3 py-5">
                      <p className="font-bold text-emerald-950">{material.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {material.summary?.trim() || 'Belum ada ringkasan.'}
                      </p>
                    </td>
                    <td className="px-3 py-5 text-sm text-slate-500">
                      {new Date(material.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        material.isPublished
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {material.isPublished ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                        {material.isPublished ? 'Dipublikasikan' : workflowLabel(material.workflowStatus)}
                      </span>
                    </td>
                    <td className="px-3 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/asatidz/keilmuan/${material.id}`}
                          aria-label={`Lihat ${material.title}`}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Eye size={17} />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === material.id}
                          onClick={() => void handleDelete(material)}
                          aria-label={`Hapus ${material.title}`}
                          className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function workflowLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Menunggu review',
    IN_REVIEW: 'Sedang direview',
    REVISION_REQUIRED: 'Perlu revisi',
    APPROVED: 'Disetujui',
    PUBLISHED: 'Dipublikasikan',
    REJECTED: 'Ditolak',
    ARCHIVED: 'Diarsipkan',
  }
  return labels[status] ?? status
}
