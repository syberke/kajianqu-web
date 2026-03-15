'use client';

import { useState, useEffect } from 'react';
import { MateriService } from '@/service/materi'; 
import { MateriCard } from '@/components/MateriCards';
import { supabase } from '@/lib/supabase/client'; 
import { Search, Loader2 } from 'lucide-react';

export default function KeilmuanPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('keilmuan').select('*').eq('is_active', true);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await MateriService.getAllMaterials(search, selectedCat);
        setMaterials(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => fetchMaterials(), 400);
    return () => clearTimeout(timer);
  }, [search, selectedCat]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      <div className="bg-[#1D794E] pt-16 pb-24 px-6 rounded-b-[60px] shadow-2xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Materi Keilmuan</h1>
          <div className="bg-white p-2 rounded-[32px] shadow-xl flex items-center">
            <div className="pl-4 text-gray-400"><Search size={20} /></div>
            <input 
              type="text" 
              placeholder="Cari materi..." 
              className="flex-1 px-4 py-3 outline-none font-bold text-emerald-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-10">
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[32px] shadow-sm sticky top-24 border border-gray-100">
            <h4 className="font-black text-[#064E3B] mb-4 uppercase text-xs">Topik</h4>
            <div className="space-y-2">
              <button onClick={() => setSelectedCat('')} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black ${!selectedCat ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>SEMUA</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black ${selectedCat === cat.id ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>
                  {cat.nama.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((m) => (
                <MateriCard 
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  category={m.keilmuan?.nama || 'Umum'}
                  book={m.summary || 'Kitab'}
                  thumbnail={m.thumbnail_url}
                />
              ))}
              {materials.length === 0 && <p className="col-span-full text-center py-20 font-black text-gray-300">MATERI TIDAK DITEMUKAN</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}