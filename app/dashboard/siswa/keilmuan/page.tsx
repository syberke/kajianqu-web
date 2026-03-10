'use client';

import { useState, useEffect } from 'react';
import { MateriService } from '@/lib/materi-service';
import { MateriCard } from '@/components/MateriCards';

import { supabase } from '@/lib/supabase'; 
import { Search, Loader2 } from 'lucide-react';

export default function KeilmuanPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('keilmuan')
        .select('*')
        .eq('is_active', true);
      
      if (!error) setCategories(data || []);
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
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMaterials();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, selectedCat]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Header Section */}
      <div className="bg-[#1D794E] pt-16 pb-24 px-6 rounded-b-[60px] shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Materi Keilmuan</h1>
          
          <div className="relative group bg-white p-2 rounded-[32px] shadow-xl flex items-center">
            <div className="pl-4 text-gray-400"><Search size={20} /></div>
            <input 
              type="text" 
              placeholder="Cari materi atau kitab..." 
              className="flex-1 px-4 py-3 text-sm font-bold outline-none text-emerald-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-10">
        {/* Sidebar Filter */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[32px] shadow-sm sticky top-24 border border-gray-100">
            <h4 className="font-black text-[#064E3B] mb-4 uppercase text-xs tracking-widest">Topik</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCat('')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all ${!selectedCat ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                SEMUA MATERI
              </button>
              {categories.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all ${selectedCat === cat.id ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  □ {cat.nama.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
              <p className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Memuat Materi...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {materials.map((m: any) => (
                <MateriCard 
                  key={m.id}
                  title={m.title}
                  category={m.keilmuan?.nama || 'Umum'}
                  book={m.summary || 'Kitab'}
                  thumbnail={m.thumbnail_url}
                  slug={m.slug}
                />
              ))}
            </div>
          )}
          
          {!loading && materials.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-inner">
              <p className="font-black text-gray-300 uppercase text-xs tracking-[0.3em]">Materi Tidak Ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}