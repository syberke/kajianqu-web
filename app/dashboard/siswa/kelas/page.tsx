'use client';

import { useState, useEffect } from 'react';
import { MateriService } from '../../../../service/materi';
import { Video, Users, Lock, ArrowRight, Loader2, Calendar } from 'lucide-react';

type TabType = 'live' | 'tematik' | 'private';

export default function KelasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let data = [];
        if (activeTab === 'live') data = await MateriService.getLiveSessions();
        else if (activeTab === 'tematik') data = await MateriService.getTematikMaterials();
        else if (activeTab === 'private') data = await MateriService.getPrivateClasses();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      <div className="bg-[#064E3B] pt-16 pb-24 px-8 rounded-b-[60px] text-center">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Kelas Belajar</h1>
        <p className="text-emerald-100/60 text-sm mt-2 font-medium">Pilih metode belajar yang paling nyaman untukmu.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 space-y-8">
        {/* Tab Switcher */}
        <div className="flex justify-center p-2 bg-white rounded-[32px] shadow-xl border border-gray-100 max-w-2xl mx-auto">
          {[
            { id: 'live', label: 'Live', icon: <Video size={16} /> },
            { id: 'tematik', label: 'Tematik', icon: <Users size={16} /> },
            { id: 'private', label: 'Private', icon: <Lock size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {items.map((item) => (
              <ClassCard key={item.id} data={item} type={activeTab} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[48px] border-2 border-dashed border-gray-100 font-black text-gray-300 uppercase text-xs tracking-[0.3em]">
                Belum ada data tersedia
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassCard({ data, type }: { data: any; type: TabType }) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
      <div className="relative h-52 overflow-hidden">
        <img 
          src={data.thumbnail_url || data.cover_url || 'https://images.unsplash.com/photo-1584281723350-2382e3d7a64a?q=80&w=800'} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt=""
        />
        {/* Badge Status untuk Live */}
        {type === 'live' && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
              data.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'
            }`}>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              {data.status}
            </span>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">
              {data.asatidz?.nama || 'Ust. Adi Hidayat'}
            </span>
          </div>
          <h3 className="text-xl font-black text-emerald-950 leading-tight group-hover:text-emerald-600 transition-colors">
            {data.title}
          </h3>
          {type === 'live' && data.scheduled_at && (
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
              <Calendar size={14} />
              {new Date(data.scheduled_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          )}
          <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">
            {data.description || 'Pelajari ilmu agama lebih dalam dengan bimbingan asatidz berpengalaman.'}
          </p>
        </div>

        <button className="mt-6 w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-2xl group/btn hover:bg-emerald-600 hover:text-white transition-all">
          <span className="text-[10px] font-black uppercase tracking-widest">
            {type === 'live' ? 'Tonton Sekarang' : 'Ikuti Kelas'}
          </span>
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}