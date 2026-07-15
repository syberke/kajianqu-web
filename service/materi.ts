export interface AsatidzMaterial {
  id: string
  title: string
  slug: string
  summary: string | null
  type: string | null
  isPublished: boolean
  createdAt: string
  keilmuan: { nama: string } | null
}

interface CreateAsatidzMaterialInput {
  title: string
  summary?: string
  type?: string
  keilmuanId?: string
}

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null
  if (!response.ok || !payload) throw new Error(payload?.error ?? fallback)
  return payload
}

export const MateriService = {
  async getAllMaterials(search = '', categoryId = '') {
    const query = new URLSearchParams()
    if (search) query.set('search', search)
    if (categoryId) query.set('categoryId', categoryId)
    const response = await fetch(`/api/materials?${query.toString()}`, { headers: { Accept: 'application/json' } })
    const payload = await readJson<{ materials?: unknown[] }>(response, 'Gagal mengambil materi')
    return payload.materials ?? []
  },

  async getMaterialById(id: string) {
    if (!id) return null
    const response = await fetch(`/api/materials/${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } })
    if (response.status === 404) return null
    const payload = await readJson<{ material?: unknown }>(response, 'Gagal mengambil materi')
    return payload.material ?? null
  },

  async getLiveSessions() {
    const response = await fetch('/api/public/catalog', { headers: { Accept: 'application/json' } })
    const payload = await readJson<{ liveSessions?: unknown[] }>(response, 'Gagal mengambil live session')
    return payload.liveSessions ?? []
  },

  async getTematikMaterials() {
    const response = await fetch('/api/materials?type=kajian_tematik', { headers: { Accept: 'application/json' } })
    const payload = await readJson<{ materials?: unknown[] }>(response, 'Gagal mengambil kajian tematik')
    return payload.materials ?? []
  },

  async getPrivateClasses() {
    const response = await fetch('/api/public/catalog', { headers: { Accept: 'application/json' } })
    const payload = await readJson<{ privateClasses?: unknown[] }>(response, 'Gagal mengambil kelas private')
    return payload.privateClasses ?? []
  },

  async getAsatidzMaterials(): Promise<AsatidzMaterial[]> {
    const response = await fetch('/api/asatidz/materials', { headers: { Accept: 'application/json' } })
    const payload = await readJson<{ materials?: AsatidzMaterial[] }>(response, 'Gagal mengambil materi Asatidz')
    return payload.materials ?? []
  },

  async createAsatidzMaterial(input: CreateAsatidzMaterialInput): Promise<AsatidzMaterial> {
    const response = await fetch('/api/asatidz/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
    })
    const payload = await readJson<{ material?: AsatidzMaterial }>(response, 'Gagal membuat materi')
    if (!payload.material) throw new Error('Materi tidak dikembalikan server')
    return payload.material
  },

  async deleteMaterial(id: string): Promise<void> {
    const response = await fetch(`/api/asatidz/materials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(payload?.error ?? 'Gagal menghapus materi')
    }
  },
}
