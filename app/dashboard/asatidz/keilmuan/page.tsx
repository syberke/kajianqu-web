'use client';

import { useState, useEffect } from 'react';
import { MateriService } from '../../../../service/materi';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  MoreVertical,
  BookOpen
} from 'lucide-react';

export default function ManajemenMateriAsatidz() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const data = await MateriService.getAsatidzMaterials(user.id);
          setMaterials(data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      await MateriService.deleteMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Banner Section - Sesuai Gambar */}
      <div className="bg-[#064E3B] rounded-[32px] p-8 text-white flex justify-between items-center shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tight">Manajemen Materi</h2>
          <p className="text-emerald-100/60 text-sm font-medium mt-1">Kirim dan kelola materi kajian Anda di sini</p>
        </div>
        <button className="relative z-10 bg-[#1D794E] hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg border border-emerald-400/20">
          <Plus size={18} strokeWidth={3} /> Buat Materi Baru
        </button>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      {/* Riwayat Table Section */}
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-black text-emerald-950 tracking-tighter">Riwayat Materi</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Cari kajian..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                <th className="pb-4 pl-6">Mapel</th>
                <th className="pb-4">Judul Materi</th>
                <th className="pb-4">Kitab</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="group bg-white hover:bg-emerald-50/30 transition-all">
                  <td className="py-5 pl-6 rounded-l-[24px] border-y border-l border-gray-50">
                    <span className="text-emerald-600 font-black text-xs uppercase">{m.keilmuan?.nama || 'Umum'}</span>
                  </td>
                  <td className="py-5 border-y border-gray-50">
                    <p className="font-bold text-emerald-950 text-sm">{m.title}</p>
                  </td>
                  <td className="py-5 border-y border-gray-50">
                    <p className="text-xs text-gray-400 font-medium">{m.summary || 'Safinatun Najah'}</p>
                  </td>
                  <td className="py-5 border-y border-gray-50">
                    <div className="flex justify-center">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                        <CheckCircle size={12} /> Verified
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-6 rounded-r-[24px] border-y border-r border-gray-50 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm">
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-600 mx-auto"></div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Menarik Data...</p>
          </div>
        )}

        {!loading && filteredMaterials.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
             <BookOpen size={40} className="mx-auto text-gray-200 mb-4" />
             <p className="font-black text-gray-300 uppercase text-xs tracking-[0.2em]">Belum Ada Materi</p>
          </div>
        )}
      </div>
    </div>
  );
}