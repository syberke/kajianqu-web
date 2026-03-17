'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

// Gambar program dari screenshot (placeholder — ganti dengan gambar real)
const imgEAbsensi = "https://www.figma.com/api/mcp/asset/64bb3f2f-7e7d-4dff-9242-c2073117017a"
const imgCBT      = "https://www.figma.com/api/mcp/asset/e10a9413-d3a1-4d05-adbf-65fed3a19ca8"

const NOMINALS = [
  { label: 'Rp 10.000',  value: 10000 },
  { label: 'Rp 25.000',  value: 25000 },
  { label: 'Rp 30.000',  value: 30000 },
  { label: 'Rp 35.000',  value: 35000 },
]

const PAYMENT_METHODS = [
  'Transfer Bank (BCA)',
  'Transfer Bank (BNI)',
  'Transfer Bank (BRI)',
  'Transfer Bank (Mandiri)',
  'BSI Mobile',
  'GoPay',
  'OVO',
  'Dana',
  'ShopeePay',
]

interface DonationPopupProps {
  onClose: () => void
  onExit: () => void
}

export default function DonationPopup({ onClose, onExit }: DonationPopupProps) {
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null)
  const [customNominal, setCustomNominal]     = useState('')
  const [isOther, setIsOther]                 = useState(false)
  const [paymentMethod, setPaymentMethod]     = useState('')
  const [paymentOpen, setPaymentOpen]         = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [success, setSuccess]                 = useState(false)

  const handleNominalClick = (value: number) => {
    setSelectedNominal(value)
    setIsOther(false)
    setCustomNominal('')
  }

  const handleOtherClick = () => {
    setIsOther(true)
    setSelectedNominal(null)
  }

  const finalNominal = isOther ? parseInt(customNominal.replace(/\D/g, '')) : selectedNominal

  const handleDonate = async () => {
    if (!finalNominal || finalNominal < 1000) return
    if (!paymentMethod) return
    setLoading(true)
    // TODO: integrate payment gateway
    await new Promise(r => setTimeout(r, 1500))
    setSuccess(true)
    setLoading(false)
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[700px] overflow-hidden shadow-2xl">

        {/* Header bar tipis abu */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">PopUp - Log Out</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          // Success state
          <div className="p-10 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-bold text-[#1a7a53]">Terima Kasih!</h3>
            <p className="text-gray-500">Donasi sebesar <strong>Rp {finalNominal?.toLocaleString('id-ID')}</strong> berhasil dikirim.</p>
            <button onClick={onClose} className="mt-4 px-8 py-3 bg-[#1a7a53] text-white rounded-xl hover:bg-[#15613f] transition-colors font-semibold">
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="px-6 pt-6 pb-4 text-center">
              <h2 className="text-xl font-bold text-gray-800 font-['Poppins',sans-serif]">
                Yuk, Bantu support untuk program kebaikan KajianQu
              </h2>
            </div>

            {/* Body — 2 kolom */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-5">

              {/* ── KIRI: Form donasi ── */}
              <div className="space-y-4">

                {/* Label pilih nominal */}
                <p className="text-[#1a7a53] font-semibold text-sm font-['Poppins',sans-serif]">Pilih Nominal</p>

                {/* Grid nominal */}
                <div className="grid grid-cols-3 gap-2">
                  {NOMINALS.map((n) => (
                    <button
                      key={n.value}
                      onClick={() => handleNominalClick(n.value)}
                      className={`py-2 px-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedNominal === n.value && !isOther
                          ? 'border-[#1a7a53] bg-[#1a7a53] text-white'
                          : 'border-gray-200 text-gray-600 hover:border-[#1a7a53] hover:text-[#1a7a53]'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                  <button
                    onClick={handleOtherClick}
                    className={`py-2 px-2 rounded-lg border text-sm font-medium transition-all ${
                      isOther
                        ? 'border-[#1a7a53] bg-[#1a7a53] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#1a7a53]'
                    }`}
                  >
                    Nominal lainnya
                  </button>
                </div>

                {/* Input nominal custom / display */}
                <div className={`flex items-center border rounded-xl px-4 h-12 gap-2 transition-all ${
                  isOther ? 'border-[#1a7a53] bg-white' : 'border-gray-200 bg-gray-50'
                }`}>
                  <span className="text-[#1a7a53] font-bold text-sm">Rp</span>
                  <input
                    type="text"
                    placeholder="Masukkan Nominal"
                    disabled={!isOther}
                    value={isOther ? customNominal : selectedNominal ? selectedNominal.toLocaleString('id-ID') : ''}
                    onChange={e => setCustomNominal(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>

                {/* Metode pembayaran */}
                <div className="relative">
                  <button
                    onClick={() => setPaymentOpen(!paymentOpen)}
                    className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 h-12 text-sm text-gray-500 hover:border-[#1a7a53] transition-colors bg-white"
                  >
                    <span className={paymentMethod ? 'text-gray-700' : 'text-gray-400'}>
                      {paymentMethod || 'Metode Pembayaran'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${paymentOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {paymentOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {PAYMENT_METHODS.map((m) => (
                        <button key={m} onClick={() => { setPaymentMethod(m); setPaymentOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-[#1a7a53] transition-colors"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pesan terima kasih */}
                <p className="text-gray-400 text-xs leading-relaxed">
                  Terimakasih atas kontribusi supportnya untuk program kebaikan KajianQu
                </p>

                {/* Tombol donasi */}
                <button
                  onClick={handleDonate}
                  disabled={loading || !finalNominal || !paymentMethod}
                  className="w-full h-12 bg-[#1a7a53] text-white rounded-xl font-semibold text-base hover:bg-[#15613f] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Donasi Sekarang'}
                </button>
              </div>

              {/* ── KANAN: Program cards ── */}
              <div className="space-y-3">
                <p className="text-gray-700 font-semibold text-sm font-['Poppins',sans-serif]">Program Buatan kami</p>

                {/* Card 1 — E-Absensi */}
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="relative h-28 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
                    <img src={imgEAbsensi} alt="E-Absensi" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5 flex-col items-end">
                        {['Pelacakan Real-time', 'Laporan Otomatis', 'Integrasi Mudah'].map(f => (
                          <span key={f} className="bg-white/90 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="text-green-500">✓</span> {f}
                          </span>
                        ))}
                      </div>
                      <p className="text-white font-bold text-sm drop-shadow">Absensi Jadi Mudah!</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-semibold text-gray-800 text-sm">E-Absensi</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">Sistem digital buat mencatat kehadiran secara otomatis (online).</p>
                  </div>
                </div>

                {/* Card 2 — CBT */}
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="relative h-28 bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden">
                    <img src={imgCBT} alt="CBT" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex justify-end gap-1.5 flex-col items-end">
                        {['Sistem Anti-Curang', 'Penilaian Otomatis', 'Analytic Hasil Studi'].map(f => (
                          <span key={f} className="bg-white/90 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="text-green-500">✓</span> {f}
                          </span>
                        ))}
                      </div>
                      <p className="text-white font-bold text-sm drop-shadow">Ujian Online terpercaya</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <p className="font-semibold text-gray-800 text-sm">CBT (Computer Based Test)</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">Sistem ujian berbasis komputer yang memungkinkan peserta mengerjakan soal secara digital.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="grid grid-cols-2 gap-3 px-6 pb-5">
              <button
                onClick={onClose}
                className="h-12 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onExit}
                className="h-12 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                keluar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}