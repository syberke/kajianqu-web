'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  ShieldCheck, 
  LogOut, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        nama: profile.nama,
        no_wa: profile.no_wa,
        updated_at: new Date()
      })
      .eq('id', profile.id);

    if (!error) {
      setMessage('Profil berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Header Profile */}
      <div className="bg-[#064E3B] pt-20 pb-32 px-6 rounded-b-[60px] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Pengaturan Profil</h1>
          <p className="text-emerald-100/60 text-sm mt-2">Kelola informasi pribadi dan keamanan akun Anda</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Foto */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-emerald-50 shadow-inner">
                  <img 
                    src={profile?.foto_url || `https://ui-avatars.com/api/?name=${profile?.nama}&background=10b981&color=fff`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                  <Camera size={18} />
                </button>
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-black text-emerald-900 text-lg leading-tight">{profile?.nama}</h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mt-2">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{profile?.role}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/logout')}
              className="w-full py-4 bg-red-50 text-red-600 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={18} /> Keluar Akun
            </button>
          </div>

          {/* Form Detail */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[48px] shadow-xl border border-gray-100 space-y-8">
              {message && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 size={20} />
                  <p className="text-sm font-bold">{message}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text" 
                      value={profile?.nama || ''}
                      onChange={(e) => setProfile({...profile, nama: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email (Hanya Baca)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="email" 
                      value={profile?.email || ''} 
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-2xl border-none font-bold text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text" 
                      value={profile?.no_wa || ''}
                      onChange={(e) => setProfile({...profile, no_wa: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={updating}
                className="w-full py-5 bg-[#1D794E] text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="animate-spin" /> : 'Simpan Perubahan'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}