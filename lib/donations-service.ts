
import { supabase } from './supabase'; 

export const DonationService = {
  async getProducts() {
   
    const { data, error } = await supabase
      .from('donation_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};