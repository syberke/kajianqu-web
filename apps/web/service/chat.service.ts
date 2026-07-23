import { supabase } from "@/lib/supabase/client";

export const ChatService = {

  async getChatHistory(asatidzId: string, studentId: string) {

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(nama,foto_url)
      `)
      .or(
        `and(sender_id.eq.${asatidzId},receiver_id.eq.${studentId}),
         and(sender_id.eq.${studentId},receiver_id.eq.${asatidzId})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data;
  },


  async sendMessage(senderId: string, receiverId: string, content: string) {

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content
      });

    if (error) throw error;
  }

};