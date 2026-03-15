import { supabase } from "@/lib/supabase/client";

export const MateriService = {

  async getAllMaterials(search = "", categoryId = "") {

    let query = supabase
      .from("materials")
      .select(`
        *,
        keilmuan:keilmuan_id(nama),
        asatidz:asatidz_id(nama,foto_url)
      `)
      .eq("is_published", true);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (categoryId) {
      query = query.eq("keilmuan_id", categoryId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false
    });

    if (error) throw error;

    return data ?? [];
  },


  async getMaterialBySlug(slug: string) {

    const { data, error } = await supabase
      .from("materials")
      .select(`
        *,
        keilmuan:keilmuan_id(nama,deskripsi),
        asatidz:asatidz_id(nama,foto_url),
        quizzes(id,title,description)
      `)
      .eq("slug", slug)
      .single();

    if (error) throw error;

    return data;
  }

};