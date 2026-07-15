import { supabase } from '@/lib/supabase/client'

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

export const MateriService = {
  async getAllMaterials(search: string = '', categoryId: string = '') {
    let query = supabase
      .from('materials')
      .select(`
        *,
        keilmuan:keilmuan_id(nama)
      `)
      .eq('is_published', true)

    if (categoryId) query = query.eq('keilmuan_id', categoryId)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getMaterialById(id: string) {
    if (!id) return null

    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        keilmuan:keilmuan_id(nama),
        asatidz:asatidz_id(nama, foto_url)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getLiveSessions() {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        asatidz:asatidz_id(nama, foto_url)
      `)
      .in('status', ['live', 'upcoming'])
      .order('scheduled_at')

    if (error) throw error
    return data ?? []
  },

  async getTematikMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        asatidz:asatidz_id(nama, foto_url)
      `)
      .eq('type', 'kajian_tematik')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async getPrivateClasses() {
    const { data, error } = await supabase
      .from('private_class_pages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async getAsatidzMaterials(): Promise<AsatidzMaterial[]> {
    const response = await fetch('/api/asatidz/materials', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error('Gagal mengambil materi Asatidz')

    const payload = (await response.json()) as { materials?: AsatidzMaterial[] }
    return payload.materials ?? []
  },

  async createAsatidzMaterial(input: CreateAsatidzMaterialInput): Promise<AsatidzMaterial> {
    const response = await fetch('/api/asatidz/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
    })
    const payload = (await response.json().catch(() => null)) as {
      material?: AsatidzMaterial
      error?: string
    } | null

    if (!response.ok || !payload?.material) {
      throw new Error(payload?.error ?? 'Gagal membuat materi')
    }
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
