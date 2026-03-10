'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Mail, Phone, MapPin, Download, CheckCircle2, 
  AlertTriangle, BookOpen, Users, Star, Search, CalendarDays,
  GraduationCap, Award, Briefcase, FileText // <-- Tambahan icon baru
} from 'lucide-react'

export default function ProfileDetailClient({ user }: { user: any }) {
  const router = useRouter()
  // Kita ubah default tabnya jadi 'dokumen' agar langsung terlihat
  const [activeTab, setActiveTab] = useState<'dokumen' | 'riwayat'>('dokumen')

  const isApproved = user.asatidz_profiles?.approved
  const cvUrl = user.asatidz_profiles?.cv_url

  return (
    <div className="space-y-6">
      {/* HEADER TITTLE */}
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
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 relative shadow-inner overflow-hidden">
               <span className="text-3xl text-gray-400 font-bold">{user.nama.substring(0,2).toUpperCase()}</span>
               {/* Indikator Online (Kuning) */}
               <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full"></div>
            </div>
            
            <h2 className="text-lg font-bold text-gray-800">{user.nama}</h2>
            
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isApproved ? 'Terverifikasi' : '⏳ Menunggu Peninjauan'}
            </div>

            <div className="w-full mt-6 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-800">{user.no_wa}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Lokasi</p>
                  <p className="text-sm font-medium text-gray-800">Bekasi, Jawa Barat</p>
                </div>
              </div>
            </div>

            <button 
              className={`w-full mt-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                cvUrl ? 'bg-[#E8F5E9] text-[#064E3B] hover:bg-[#d1ecd4]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => cvUrl && window.open(cvUrl, '_blank')}
            >
              <Download size={18} /> {cvUrl ? 'Download CV' : 'Belum Ada CV'}
            </button>
          </div>

          {/* Card Catatan Keamanan */}
          <div className="bg-[#f2f9f1] p-5 rounded-2xl border border-green-100 shadow-sm">
            <h3 className="font-bold text-[#064E3B] text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} /> Catatan Keamanan
            </h3>
            <ul className="space-y-3 text-xs text-[#064E3B]/80 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 text-[#064E3B]" /> 
                Email telah diverifikasi secara sistem.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="mt-0.5 text-[#064E3B]" /> 
                Identitas KTP sesuai dengan data input.
              </li>
              <li className="flex items-start gap-2 text-yellow-600">
                <AlertTriangle size={14} className="mt-0.5" /> 
                Sertifikasi BNSP memerlukan pengecekan manual.
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
              Detail Dokumen
            </button>
            <button 
              onClick={() => setActiveTab('riwayat')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#064E3B] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Riwayat Kegiatan
            </button>
          </div>

          {/* KONTEN TAB: DETAIL DOKUMEN */}
          {activeTab === 'dokumen' && (
            <div className="space-y-6">
              
              {/* Latar Belakang Pendidikan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-[#064E3B]" size={20} /> Latar Belakang Pendidikan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><GraduationCap size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">S2 – Islamic Jurisprudence (Fiqh)</p>
                        <p className="text-xs text-gray-500">Universitas Al-Azhar, Kairo, Mesir</p>
                        <p className="text-[10px] text-gray-400 mt-1">Lulus: 2011 • IPK: 3.92/4.00</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-[#064E3B] hover:underline uppercase tracking-wider">Lihat Dokumen</button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><GraduationCap size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">S1 – Syariah & Hukum</p>
                        <p className="text-xs text-gray-500">LIPIA, Jakarta</p>
                        <p className="text-[10px] text-gray-400 mt-1">Lulus: 2007</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-[#064E3B] hover:underline uppercase tracking-wider">Lihat Dokumen</button>
                  </div>
                </div>
              </div>

              {/* Sertifikasi & Keahlian */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="text-[#064E3B]" size={20} /> Sertifikasi & Keahlian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sanad Al-Quran</p>
                    <p className="font-bold text-gray-800 text-sm mb-3">Hafidz 30 Juz – Riwayat Hafs 'an 'Ashim</p>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">TERVERIFIKASI</span>
                    <FileText size={16} className="absolute bottom-4 right-4 text-[#064E3B]" />
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Metode Dakwah</p>
                    <p className="font-bold text-gray-800 text-sm mb-3">Sertifikasi Dai BNSP Indonesia</p>
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded">PROSES CEK</span>
                    <FileText size={16} className="absolute bottom-4 right-4 text-[#064E3B]" />
                  </div>
                </div>
              </div>

              {/* Pengalaman Mengajar (Timeline) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Briefcase className="text-[#064E3B]" size={20} /> Pengalaman Mengajar
                </h3>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-2">
                  <div className="relative pl-6">
                <div className="absolute -left-2.25 top-1 w-4 h-4 bg-white border-4 border-[#064E3B] rounded-full"></div>
                    <p className="font-bold text-gray-800 text-sm">Pengasuh Quantum Akhyar Institute</p>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">2013 - Sekarang</p>
                    <p className="text-xs text-gray-500">Fokus pada pendalaman Al-Quran dan Sunnah secara tematik dan aplikatif.</p>
                  </div>
                  <div className="relative pl-6">
                 <div className="absolute -left-2.25 top-1 w-4 h-4 bg-white border-4 border-[#064E3B] rounded-full"></div>
                    <p className="font-bold text-gray-800 text-sm">Dosen Tamu Studi Islam</p>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">2011 - 2013</p>
                    <p className="text-xs text-gray-500">Berbagai universitas ternama di Timur Tengah dan Indonesia.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* KONTEN TAB: RIWAYAT KEGIATAN */}
          {activeTab === 'riwayat' && (
            <div className="space-y-6">
              {/* Stats Cards Mini */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <BookOpen size={18} className="text-green-500" />
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12.5%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total Kelas</p>
                  <p className="text-xl font-bold text-gray-800">128</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Users size={18} className="text-green-500" />
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+4.2%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Total Murid</p>
                  <p className="text-xl font-bold text-gray-800">42</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Star size={18} className="text-green-500" />
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+0.2%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <p className="text-xl font-bold text-gray-800">4.9 <span className="text-xs text-gray-400 font-medium">/ 5.0</span></p>
                </div>
              </div>

              {/* Tabel Riwayat */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Private Class History</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Search student or class..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#064E3B]" />
                    </div>
                    <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      <CalendarDays size={14} /> dd/mm/th
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
                      <tr>
                        <th className="pb-3">Class Name</th>
                        <th className="pb-3">Nama Murid</th>
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Revenue/Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <TableRow kelas="Tafsir Al-Baqarah" level="Advanced Level" murid="Ahmad Sulaiman" date="Oct 24, 2023" time="08:00 - 09:30 AM" status="Completed" statusColor="bg-green-100 text-green-700" points="150 pts" />
                      <TableRow kelas="Fiqh Ibadah" level="Intermediate" murid="Ibrahim Khalil" date="Oct 24, 2023" time="10:00 - 11:30 AM" status="Ongoing" statusColor="bg-blue-100 text-blue-700" points="Pending" />
                      <TableRow kelas="Arabic Grammar" level="Beginner" murid="Maryam Jamilah" date="Oct 23, 2023" time="04:00 - 05:00 PM" status="Completed" statusColor="bg-green-100 text-green-700" points="120 pts" />
                      <TableRow kelas="Halaqah Tahfidz" level="Juz 30" murid="Fatima Az-Zahra" date="Oct 22, 2023" time="06:00 - 07:30 PM" status="Cancelled" statusColor="bg-red-100 text-red-700" points="0 pts" />
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

// Komponen Pembantu Baris Tabel
function TableRow({ kelas, level, murid, date, time, status, statusColor, points }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3">
        <p className="font-bold text-gray-800">{kelas}</p>
        <p className="text-[10px] text-gray-500">{level}</p>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] flex items-center justify-center font-bold text-gray-600">
            {murid.charAt(0)}
          </div>
          <span className="font-medium text-gray-800">{murid}</span>
        </div>
      </td>
      <td className="py-3">
        <p className="font-medium text-gray-800">{date}</p>
        <p className="text-[10px] text-gray-500">{time}</p>
      </td>
      <td className="py-3">
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>{status}</span>
      </td>
      <td className="py-3 text-right font-bold text-gray-800">{points}</td>
    </tr>
  )
}