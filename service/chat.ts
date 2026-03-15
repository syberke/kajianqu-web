import { supabase } from '@/lib/supabase/client';

export const ChatService = {
  async getInbox(asatidzId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
  sender_id,
  content,
  created_at,
  profiles:sender_id(nama, foto_url)
`)
      .eq('receiver_id', asatidzId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },


  async getChatHistory(asatidzId: string, studentId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${asatidzId},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${asatidzId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },


  async sendMessage(senderId: string, receiverId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
    
    if (error) throw error;
    return data;
  }
};