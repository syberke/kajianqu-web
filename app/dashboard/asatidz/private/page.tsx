'use client';

import { useState } from 'react';
import { AsatidzService } from '@/services/asatidz';
import { CheckCircle, Link as LinkIcon, Video, ArrowLeft, Loader2 } from 'lucide-react';

export default function CreatePrivateClass() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    zoom_link: '',
    passcode: Math.floor(100000 + Math.random() * 900000).toString() // Auto generate kode
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Logic simpan ke database
      // await AsatidzService.createPrivateClass(formData);
      setResult(formData);
      setStep('success');
    } catch (err) {
      alert("Gagal membuat kelas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-emerald-950 tracking-tighter">Buat Kelas Private</h2>
        <button className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">Lihat Riwayat</button>
      </div>

      {step === 'form' ? (
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Materi Kajian</label>
            <input 
              type="text" 
              placeholder="Contoh: Akhlakul Lil Banin" 
              className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Link Zoom</label>
              <input 
                type="text" 
                placeholder="HTTPS://Zoom.us/j/..." 
                className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 transition-all"
                onChange={(e) => setFormData({...formData, zoom_link: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kode</label>
              <input 
                type="text" 
                value={formData.passcode}
                readOnly
                className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold text-gray-400"
              />
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || !formData.title}
            className="w-full py-5 bg-[#1D794E] text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Buat Sekarang'}
          </button>
        </div>
      ) : (
        /* SUCCESS VIEW - Gambar 9 */
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px] flex items-center gap-4 text-emerald-700">
             <CheckCircle className="text-emerald-500" />
             <div>
                <p className="font-black text-sm uppercase tracking-tight">Anda Telah Membuat Kelas</p>
                <p className="text-xs font-medium opacity-80">Tetap berada di Zoom untuk mengisi kajian anda</p>
             </div>
          </div>

          <div className="space-y-6 px-4">
             <div className="flex border-b border-gray-50 py-4">
                <span className="w-24 text-sm font-black text-emerald-950">Materi</span>
                <span className="text-sm font-bold text-gray-400">: {result.title}</span>
             </div>
             <div className="flex border-b border-gray-50 py-4">
                <span className="w-24 text-sm font-black text-emerald-950">Link</span>
                <span className="text-sm font-bold text-blue-500">: {result.zoom_link}</span>
             </div>
             <div className="flex py-4">
                <span className="w-24 text-sm font-black text-emerald-950">Kode</span>
                <span className="text-sm font-bold text-gray-400">: {result.passcode}</span>
             </div>
          </div>

          <button onClick={() => setStep('form')} className="w-full py-4 bg-gray-50 text-emerald-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
             <ArrowLeft size={14} /> Buat Kelas Lainnya
          </button>
        </div>
      )}
    </div>
  );
}