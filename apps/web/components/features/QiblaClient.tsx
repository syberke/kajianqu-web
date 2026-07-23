'use client'

import { useState } from 'react'
import { Compass, LocateFixed } from 'lucide-react'

function toRadians(value: number) {
  return value * Math.PI / 180
}

function toDegrees(value: number) {
  return value * 180 / Math.PI
}

function qiblaBearing(latitude: number, longitude: number) {
  const kaabaLatitude = toRadians(21.4225)
  const longitudeDifference = toRadians(39.8262 - longitude)
  const userLatitude = toRadians(latitude)
  const y = Math.sin(longitudeDifference)
  const x = Math.cos(userLatitude) * Math.tan(kaabaLatitude) - Math.sin(userLatitude) * Math.cos(longitudeDifference)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export default function QiblaClient() {
  const [bearing, setBearing] = useState<number | null>(null)
  const [message, setMessage] = useState('Izinkan lokasi untuk menghitung arah kiblat dari posisi Anda.')

  function locate() {
    if (!navigator.geolocation) {
      setMessage('Perangkat ini tidak mendukung geolocation.')
      return
    }
    setMessage('Mencari lokasi...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBearing(qiblaBearing(coords.latitude, coords.longitude))
        setMessage(`Lokasi ditemukan pada ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}.`)
      },
      (error) => setMessage(error.message || 'Lokasi belum dapat dibaca.'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fbfa] pt-[72px]">
      <section className="rounded-b-[36px] bg-[#157a52] px-6 py-16 text-center text-white">
        <Compass className="mx-auto text-[#d3ad0f]" size={46} />
        <h1 className="mt-5 text-4xl font-black">Arah Kiblat</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#d9f1e8]">Kompas dihitung langsung dari koordinat perangkat menuju Ka&apos;bah.</p>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-[28px] border border-[#e2ebe7] bg-white p-8 text-center shadow-[0_16px_50px_rgba(14,74,52,0.08)]">
          <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full border-[12px] border-[#e8f5ef]">
            <span className="absolute top-4 text-sm font-black text-[#157a52]">UTARA</span>
            <div className="h-28 w-1.5 origin-bottom rounded-full bg-[#d3ad0f] transition-transform duration-700" style={{ transform: `translateY(-28px) rotate(${bearing ?? 0}deg)` }} />
            <div className="absolute h-5 w-5 rounded-full border-4 border-white bg-[#157a52] shadow" />
          </div>
          <p className="mt-7 text-4xl font-black text-[#153c2d]">{bearing === null ? '---°' : `${bearing.toFixed(1)}°`}</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>
          <button onClick={locate} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#157a52] px-6 py-3 text-sm font-bold text-white">
            <LocateFixed size={18} /> Gunakan lokasi saya
          </button>
        </div>
      </section>
    </div>
  )
}
