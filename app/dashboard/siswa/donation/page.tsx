'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client'; 
import { 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Loader2, 
  UploadCloud, 
  ImageIcon,
  X
} from 'lucide-react';

export default function InfaqPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'Infaq Umum',
    nominal: '',
    donor_name: '',
    note: '',
    method_id: ''
  });

  useEffect(() => {
    const fetchMethods = async () => {
      const { data, error } = await supabase
        .from('donation_methods')
        .select('*')
        .eq('is_active', true);
      if (!error) setMethods(data || []);
    };
    fetchMethods();
  }, []);

  // Handler Pilih File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitInfaq = async () => {
    const cleanNominal = parseInt(formData.nominal);
    if (!cleanNominal || !formData.method_id) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let proofUrl = null;

    
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('donations')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('donations')
          .getPublicUrl(filePath);
        
        proofUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('donations').insert([{
        user_id: user?.id,
        category: formData.category,
        nominal: cleanNominal,
        method_id: formData.method_id,
        donor_name: formData.donor_name || 'Hamba Allah',
        note: formData.note,
        payment_status: 'pending',
        payment_proof_url: proofUrl 
      }]);

      if (error) throw error;
      setStep(3); 
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = methods.find(m => m.id === formData.method_id);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      <div className="bg-[#1D794E] pt-20 pb-32 px-6 rounded-b-[64px] text-center text-white">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Infaq & Sedekah</h1>
        <p className="opacity-70 text-sm mt-2 font-medium italic">"Harta tidak akan berkurang karena sedekah"</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-20">
        
        {/* STEP 1: INPUT DATA */}
        {step === 1 && (
          <div className="bg-white rounded-[48px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tujuan Infaq</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Infaq Umum">Infaq Umum</option>
                  <option value="Wakaf Quran">Wakaf Quran</option>
                  <option value="Sedekah Jariyah">Sedekah Jariyah</option>
                  <option value="Operasional Dakwah">Operasional Dakwah</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nominal (Rp)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 50000"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.nominal}
                  onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Metode Pembayaran</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {methods.map((m) => (
                  <button 
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({...formData, method_id: m.id})}
                    className={`p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${formData.method_id === m.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                    <div className={`${formData.method_id === m.id ? 'text-emerald-600' : 'text-gray-300'}`}>
                        {m.method_type === 'qris' ? <QrCode size={28} /> : <Banknote size={28} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-tighter opacity-60 leading-none mb-1">{m.method_type === 'qris' ? 'Scan Otomatis' : 'Transfer Manual'}</p>
                      <p className="font-black text-sm">{m.bank_name || 'QRIS'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!formData.nominal || !formData.method_id}
              className="w-full py-5 bg-[#1D794E] text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all disabled:opacity-50"
            >
              Lanjutkan Pembayaran
            </button>
          </div>
        )}

        {/* STEP 2: INSTRUKSI & UPLOAD BUKTI */}
        {step === 2 && (
          <div className="bg-white rounded-[48px] p-10 shadow-2xl text-center space-y-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Instruksi Pembayaran</p>
              <h2 className="text-2xl font-black text-emerald-900 leading-tight">Transfer & Upload Bukti</h2>
            </div>

            <div className="p-8 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              {selectedMethod?.method_type === 'qris' ? (
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-3xl inline-block shadow-sm">
                      <img src={selectedMethod.qris_image_url} alt="QRIS" className="w-48 h-48 mx-auto" />
                   </div>
                   <p className="text-xs font-bold text-gray-400">Scan QRIS di atas untuk membayar</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Kirim Ke {selectedMethod?.bank_name}</p>
                  <p className="text-4xl font-black text-emerald-700 tracking-tighter">{selectedMethod?.account_number}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">a.n {selectedMethod?.account_name}</p>
                </div>
              )}
            </div>

            {/* UPLOAD AREA */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Upload Bukti Transfer (Opsional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group h-40 w-full border-2 border-dashed border-emerald-200 rounded-[32px] bg-emerald-50/30 flex flex-col items-center justify-center transition-all hover:bg-emerald-50"
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-2">
                    <img src={previewUrl} className="w-full h-full object-contain rounded-2xl" alt="Preview" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="text-emerald-300 mb-2" size={32} />
                    <p className="text-xs font-bold text-emerald-600">Klik untuk pilih foto struk</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Total Infaq</span>
              <span className="text-2xl font-black text-emerald-900">Rp {parseInt(formData.nominal).toLocaleString('id-ID')}</span>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xs uppercase tracking-widest">Kembali</button>
              <button 
                onClick={handleSubmitInfaq}
                disabled={loading}
                className="flex-[2] py-4 bg-[#1D794E] text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UploadCloud size={18}/> Konfirmasi Infaq</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="bg-white rounded-[48px] p-16 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-black text-emerald-900 leading-tight">Alhamdulillah,<br/>Jazakallah Khairan!</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto">Infaq Anda sedang kami verifikasi. Semoga Allah membalas kebaikan Anda.</p>
            <button onClick={() => window.location.href = '/dashboard/siswa'} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Kembali ke Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}