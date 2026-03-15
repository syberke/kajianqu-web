import { supabase } from '@/lib/supabase/client';

export const MateriService = {

  async getAllMaterials(search: string = '', categoryId: string = '') {

    let query = supabase
      .from('materials')
      .select(`
        *,
        keilmuan:keilmuan_id(nama)
      `)
      .eq('is_published', true);

    if (categoryId) {
      query = query.eq('keilmuan_id', categoryId);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data ?? [];
  },


  async getMaterialById(id: string) {

    if (!id) return null;

    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        keilmuan:keilmuan_id(nama),
        asatidz:asatidz_id(nama, foto_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  },


  async getLiveSessions() {

    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        asatidz:asatidz_id(nama, foto_url)
      `)
      .in('status', ['live', 'upcoming'])
      .order('scheduled_at');

    if (error) throw error;

    return data ?? [];
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
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data ?? [];
  },


  async getPrivateClasses() {

    const { data, error } = await supabase
      .from('private_class_pages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data ?? [];
  }

};