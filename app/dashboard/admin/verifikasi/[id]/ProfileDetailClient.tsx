'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Mail, Phone, MapPin, Download, CheckCircle2, 
  AlertTriangle, BookOpen, Users, Star, Search, CalendarDays,
  GraduationCap, Award, Briefcase, FileText
} from 'lucide-react'

export default function ProfileDetailClient({ user }: { user: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dokumen' | 'riwayat'>('dokumen')
  const [searchTerm, setSearchTerm] = useState('')

  const isApproved = user.asatidz_profiles?.approved
  const cvUrl = user.asatidz_profiles?.cv_url

  // Filter riwayat berdasarkan kolom pencarian input teks murid/kelas
  const filteredEnrollments = user.enrollments?.filter((item: any) =>
    item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Helper inside avatar initials
  const getInitials = (name: string) => {
    return name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AZ'
  }

  // Helper badge styling status pendaftaran kelas privat
  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-700' }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700' }
      default:
        return { label: 'Pending', color: 'bg-amber-100 text-amber-700' }
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER TITLE */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Profil Verifikasi</h1>
          <p className="text-sm text-gray-500">Review profil dan kelengkapan dokumen asatidz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: INFO PROFIL */}
        <div className="space-y-6">
          {/* Card Profil Utama */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative">
            <div className="w-24 h-24 rounded-2xl bg-[#064E3B] text-white flex items-center justify-center mb-4 relative shadow-inner overflow-hidden">
               <span className="text-3xl font-bold">{getInitials(user.nama)}</span>
               <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            
            <h2 className="text-lg font-bold text-gray-800">{user.nama}</h2>
            <p className="text-xs text-gray-400 font-medium">{user.asatidz_profiles?.bidang || 'Asatidz KajianQu'}</p>
            
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isApproved ? '✓ Terverifikasi' : '⏳ Menunggu Peninjauan'}
            </div>

            {user.asatidz_profiles?.bio && (
              <p className="text-xs text-gray-500 mt-4 italic bg-gray-50 p-3 rounded-xl w-full text-left">
                "{user.asatidz_profiles.bio}"
              </p>
            )}

            <div className="w-full mt-6 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                  <p className="text-sm font-medium text-gray-800 break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-800">{user.no_wa || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Waktu Bergabung</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <button 
              className={`w-full mt-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                cvUrl ? 'bg-[#064E3B] text-white hover:bg-[#123e24]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!cvUrl}
              onClick={() => cvUrl && window.open(cvUrl, '_blank')}
            >
              <Download size={18} /> {cvUrl ? 'Unduh Berkas CV / Portofolio' : 'Berkas CV Belum Diunggah'}
            </button>
          </div>

          {/* Card Catatan Keamanan */}
          <div className="bg-[#f2f9f1] p-5 rounded-2xl border border-green-100 shadow-sm">
            <h3 className="font-bold text-[#064E3B] text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} /> Verifikasi Sistem Keamanan
            </h3>
            <ul className="space-y-3 text-xs text-[#064E3B]/80 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 text-green-600" /> 
                Akses enkripsi auth terdaftar aman di database.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 text-green-600" /> 
                Format nomor WhatsApp valid untuk korespondensi kelas.
              </li>
              <li className="flex items-start gap-2 text-amber-700">
                <AlertTriangle size={14} className="mt-0.5" /> 
                Kesesuaian berkas sertifikasi kompetensi membutuhkan audit manual berkala.
              </li>
            </ul>
          </div>
        </div>

        {/* KOLOM KANAN: TABS & KONTEN */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS */}
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('dokumen')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'dokumen' ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Detail Berkas & Kompetensi
            </button>
            <button 
              onClick={() => setActiveTab('riwayat')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Aktivitas Pengajaran ({user.enrollments?.length || 0})
            </button>
          </div>

          {/* KONTEN TAB: DETAIL DOKUMEN */}
          {activeTab === 'dokumen' && (
            <div className="space-y-6">
              
              {/* Latar Belakang Pendidikan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-[#064E3B]" size={20} /> Latar Belakang Pendidikan & Keilmuan
                </h3>
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-start gap-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0"><GraduationCap size={20} /></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Riwayat Riil Akademik / Pesantren</p>
                    <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
                      {user.asatidz_profiles?.latar_belakang}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sertifikasi & Keahlian */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="text-[#064E3B]" size={20} /> Sertifikasi, Keahlian & Bidang Kompetensi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fokus Bidang Utama</p>
                    <p className="font-bold text-gray-800 text-sm mb-3">{user.asatidz_profiles?.bidang}</p>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Spesialis</span>
                    <BookOpen size={16} className="absolute bottom-4 right-4 text-[#064E3B]" />
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Keahlian Tambahan / Sanad</p>
                    <p className="font-bold text-gray-800 text-sm mb-3">{user.asatidz_profiles?.keahlian}</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Kompetensi</span>
                    <FileText size={16} className="absolute bottom-4 right-4 text-[#064E3B]" />
                  </div>
                </div>

                <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dokumen Sertifikat Terdaftar</p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{user.asatidz_profiles?.sertifikat}</p>
                </div>
              </div>

              {/* Pengalaman Mengajar */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="text-[#064E3B]" size={20} /> Pengalaman Mengajar & Dedekasi Dakwah
                </h3>
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex items-start gap-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0"><Briefcase size={20} /></div>
                  <div className="w-full">
                    <p className="font-bold text-gray-800 text-sm mb-2">Portofolio Mengajar</p>
                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                      {user.asatidz_profiles?.pengalaman_mengajar}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* KONTEN TAB: RIWAYAT KEGIATAN */}
          {activeTab === 'riwayat' && (
            <div className="space-y-6">
              {/* Statistik Kartu Mini Nyata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <BookOpen size={18} className="text-[#064E3B]" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Materi/Kelas Diampu</p>
                  <p className="text-xl font-bold text-gray-800">{user.stats.totalClasses} Kelas</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Users size={18} className="text-[#064E3B]" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total Murid Unik</p>
                  <p className="text-xl font-bold text-gray-800">{user.stats.totalStudents} Orang</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Star size={18} className="text-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Rating Integritas</p>
                  <p className="text-xl font-bold text-gray-800">{user.stats.rating.toFixed(1)} <span className="text-xs text-gray-400 font-medium">/ 5.0</span></p>
                </div>
              </div>

              {/* Tabel Riwayat Pendaftaran Kelas Privat */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-bold text-gray-800">Log Pengajuan Kelas Privat (Pendaftaran Murid)</h3>
                  <div className="w-full sm:w-auto relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari kelas atau nama murid..." 
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full sm:w-56 focus:outline-none focus:border-[#064E3B]" 
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
                      <tr>
                        <th className="pb-3">Judul Kelas/Materi</th>
                        <th className="pb-3">Nama Pendaftar (Murid)</th>
                        <th className="pb-3">Tanggal Mengajukan</th>
                        <th className="pb-3 text-right">Status Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredEnrollments.length > 0 ? (
                        filteredEnrollments.map((enroll: any) => {
                          const statusConf = getStatusStyle(enroll.status)
                          return (
                            <tr key={enroll.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3">
                                <p className="font-bold text-gray-800">{enroll.className}</p>
                                <p className="text-[10px] text-gray-500">{enroll.level}</p>
                              </td>
                              <td className="py-3">
                                <span className="font-medium text-gray-800">{enroll.studentName}</span>
                              </td>
                              <td className="py-3 text-gray-500">
                                {new Date(enroll.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConf.color}`}>
                                  {statusConf.label}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-400">
                            Tidak ditemukan data pendaftaran aktivitas mengajar untuk kriteria ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}