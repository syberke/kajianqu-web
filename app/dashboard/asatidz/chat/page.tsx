'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ChatService } from '../../../../service/chat';
import { Send, Search, MoreVertical, Phone, Video, Smile,MessageSquare } from 'lucide-react';

export default function ChatAsatidzPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [inbox, setInbox] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Inbox
  useEffect(() => {
    async function loadInbox() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await ChatService.getInbox(user.id);
        setInbox(data || []);
      }
    }
    loadInbox();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await ChatService.sendMessage(user.id, selectedStudent.id, newMessage);
      setMessages([...messages, { sender_id: user.id, content: newMessage, created_at: new Date() }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm">
      
      {/* LEFT: Daftar Chat (Inbox) */}
      <div className="w-96 border-r border-gray-50 flex flex-col">
        <div className="p-8 space-y-6">
          <h3 className="text-2xl font-black text-emerald-950 tracking-tighter">Pesan Santri</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input type="text" placeholder="Cari santri..." className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-xs font-bold outline-none" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {/* Contoh Item Chat */}
          <button 
            onClick={() => setSelectedStudent({id: '1', nama: 'Ahmad Fulan'})}
            className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-all ${selectedStudent?.id === '1' ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
          >
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black">A</div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-black text-emerald-950 text-sm truncate">Ahmad Fulan</p>
              <p className="text-[10px] text-gray-400 font-bold truncate">Ustadz, izin bertanya ttg...</p>
            </div>
            <span className="text-[8px] font-black text-gray-300 uppercase">12m</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Area Percakapan */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedStudent ? (
          <>
            {/* Header Chat */}
            <div className="p-6 bg-white border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#064E3B] rounded-2xl flex items-center justify-center text-white font-black">
                  {selectedStudent.nama[0]}
                </div>
                <div>
                  <p className="font-black text-emerald-950 text-sm">{selectedStudent.nama}</p>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <button className="p-3 hover:bg-gray-50 rounded-xl transition-all"><Phone size={20} /></button>
                <button className="p-3 hover:bg-gray-50 rounded-xl transition-all"><Video size={20} /></button>
                <button className="p-3 hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Bubble Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm font-medium text-gray-600">
                  Ustadz, apakah hukumnya tahlilan itu bid'ah?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-[#064E3B] p-4 rounded-2xl rounded-tr-none shadow-lg text-sm font-medium text-white">
                  Pertanyaan bagus, mari kita bahas dari sudut pandang fiqh empat madzhab...
                </div>
              </div>
              <div ref={chatEndRef} />
            </div>

            {/* Input Chat */}
            <div className="p-8 bg-white border-t border-gray-50">
              <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-[24px]">
                <button className="p-3 text-gray-400"><Smile size={20} /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ketik balasan..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-emerald-950"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-[#064E3B] text-white p-4 rounded-2xl shadow-lg hover:bg-emerald-800 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={40} />
            </div>
            <h4 className="font-black text-emerald-950 text-xl tracking-tighter">Pilih Pesan</h4>
            <p className="text-sm text-gray-400 font-medium max-w-xs">Pilih salah satu santri di sebelah kiri untuk mulai berdiskusi.</p>
          </div>
        )}
      </div>
    </div>
  );
}