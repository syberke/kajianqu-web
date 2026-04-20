import React from 'react';
import DonasiHeader from '../../../../components/DonasiHeader';
import { products } from '../data/donasi';

export default function KatalogPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <DonasiHeader title="Katalog Produk" />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
           <input 
            type="text" 
            placeholder="Masukan nama Produk..." 
            className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
           />
           <button className="px-10 py-4 bg-emerald-700 text-white font-bold rounded-2xl">Cari</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-48 overflow-hidden">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={p.name} />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded">Baru</span>
              </div>
              <div className="p-4">
                <h5 className="font-bold text-gray-800 mb-1">{p.name}</h5>
                <p className="text-emerald-600 font-bold text-sm mb-3">Rp {p.price.toLocaleString('id-ID')}</p>
                <button className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:gap-2 transition-all">
                  Hubungi Kami <span className="text-lg">›</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}