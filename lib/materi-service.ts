// 1. Ganti import-nya ke file 'supabase.ts' yang sudah kita buat sebelumnya
import { supabase } from './supabase'; 

export const MateriService = {
  // Ambil semua materi untuk halaman list
  async getAllMaterials(search = '', categoryId = '') {
    // Gunakan 'supabase' (tanpa const lagi karena sudah di-import di atas)
    let query = supabase
      .from('materials')
      .select(`
        *,
        profiles:asatidz_id(nama),
        keilmuan:keilmuan_id(nama)
      `)
      .eq('is_published', true);

    if (search) query = query.ilike('title', `%${search}%`);
    if (categoryId) query = query.eq('keilmuan_id', categoryId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Ambil detail materi berdasarkan slug untuk halaman detail
  async getMaterialBySlug(slug: string) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        asatidz:asatidz_id(nama, foto_url),
        keilmuan:keilmuan_id(nama, deskripsi),
        quizzes(id, title, description)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }
};