'use client';

import { useState } from 'react';
import { MateriService } from '@/services/materi';
import { supabase } from '@/lib/supabase/client';
import { 
  Send, 
  Youtube, 
  Book, 
  Layers, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function UploadMateriPage() {
  const [step, setStep] = useState<'form' | 'status'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    kitab: '',
    level: 'Mudah',
    youtube_url: '',
    description: ''
  });

  const handleUpload = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await MateriService.uploadMaterial({
        asatidz_id: user?.id,
        title: formData.title,
        type: 'kajian_tematik', // Sesuai schema tabel
        slug: formData.title.toLowerCase().replace(/ /g, '-'),
        youtube_url: formData.youtube_url,
        description: formData.description,
        summary: formData.kitab, // Kita map 'Nama Kitab' ke 'Summary'
        is_published: false // Default false sebelum diverifikasi admin
      });
      setStep('status');
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-[#064E3B] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Keilmuan {'>'} Upload</p>
          <h2 className="text-3xl font-black tracking-tighter">Upload Materi Baru</h2>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      {step === 'form' ? (
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Mata Pelajaran" placeholder="Contoh: Akhlak" value={formData.subject} onChange={(v) => setFormData({...formData, subject: v})} />
            <InputGroup label="Judul Materi" placeholder="Contoh: Hukumnya Tahlilan" value={formData.title} onChange={(v) => setFormData({...formData, title: v})} />
            <InputGroup label="Nama Kitab" placeholder="Contoh: Safinatun Najah" value={formData.kitab} onChange={(v) => setFormData({...formData, kitab: v})} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Level</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option>Mudah</option>
                <option>Menengah</option>
                <option>Sulit</option>
                <option>Sangat Sulit</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link Youtube</label>
              <span className="text-[9px] font-bold text-gray-300 uppercase">Minimal 30 menit</span>
            </div>
            <div className="relative">
              <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Link HTTPS://Youtube.com" 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                value={formData.youtube_url}
                onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Deskripsi</label>
            <textarea 
              rows={4}
              placeholder="Deskripsi tentang materi..." 
              className="w-full p-6 bg-gray-50 rounded-[32px] border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-5 bg-[#064E3B] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-3"
          >
            {loading ? 'Mengirim...' : 'Kirim Sekarang'} <Send size={18} />
          </button>
        </div>
      ) : (
        /* Status Verifikasi - Sesuai Gambar 6 & 7 */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px] flex items-center gap-4 text-orange-700">
               <Clock className="animate-pulse" />
               <div>
                  <p className="font-black text-sm uppercase tracking-tight">Menunggu Verifikasi</p>
                  <p className="text-xs font-medium opacity-80">Menunggu Verifikasi dari admin, Pantau terus akun anda</p>
               </div>
            </div>

            <h4 className="font-black text-emerald-950 text-xl tracking-tighter mt-8">Riwayat Materi</h4>
            <div className="space-y-4">
              <HistoryItem title="Hukumnya Tahlilan" time="2 menit yang lalu" status="pending" />
              <HistoryItem title="Keutamaan Bulan Ramadhan" time="15 menit yang lalu" status="pending" />
              <HistoryItem title="Adab Bertetangga" time="1 jam yang lalu" status="verified" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <h4 className="font-black text-emerald-950 text-lg tracking-tighter leading-none">Detail Verifikasi</h4>
               <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase">Pending</span>
            </div>
            
            <div className="aspect-video bg-gray-100 rounded-[24px] overflow-hidden flex items-center justify-center relative group cursor-pointer">
               <img src="/placeholder-kajian.jpg" className="w-full h-full object-cover opacity-50" />
               <div className="absolute inset-0 flex items-center justify-center font-black text-gray-400 italic">Full Preview</div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Link Youtube</p>
                <a href="#" className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:underline">HTTPS://WWW.YOUTUBE.COM <ExternalLink size={10} /></a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <MiniStat label="Nama Kitab" val="Safinatun Najah" />
                <MiniStat label="Mata Pelajaran" val="Akhlak" />
                <MiniStat label="Level" val="Menengah" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Deskripsi Materi</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">"Adalah program pembelajaran eksklusif dengan pendampingan langsung dari mentor berpengalaman..."</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Internal UI Components ---

function InputGroup({ label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function HistoryItem({ title, time, status }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-[32px] hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
           <Youtube size={20} />
        </div>
        <div>
          <h5 className="font-black text-emerald-950 text-sm group-hover:text-emerald-600 transition-colors">{title}</h5>
          <p className="text-[10px] font-bold text-gray-300 uppercase mt-1 tracking-widest">Ust. Muhammad Iqbal • {time}</p>
        </div>
      </div>
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
        {status === 'pending' ? 'Menunggu' : 'Verified'}
      </span>
    </div>
  );
}

function MiniStat({ label, val }: any) {
  return (
    <div>
      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none">{label}</p>
      <p className="text-[10px] font-black text-emerald-950 leading-none">{val}</p>
    </div>
  );
}