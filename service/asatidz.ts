import { supabase } from '@/lib/supabase/client';

export const MateriService = {

  async getAsatidzMaterials(asatidzId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        keilmuan:keilmuan_id(nama)
      `)
      .eq('asatidz_id', asatidzId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },


  async deleteMaterial(id: string) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};