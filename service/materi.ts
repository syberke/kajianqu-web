import { supabase } from '@/lib/supabase';

export const MateriService = {

  async getLiveSessions() {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`
        *,
        asatidz:asatidz_id(nama, foto_url)
      `)
      .in('status', ['live', 'upcoming'])
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data;
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
    return data;
  },

  async getPrivateClasses() {
    const { data, error } = await supabase
      .from('private_class_pages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};