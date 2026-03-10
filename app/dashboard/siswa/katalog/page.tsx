'use client';

import { useState, useEffect } from 'react';
import { DonationService } from '../../../../lib/donations-service';
import { ShoppingBag, MessageCircle, Heart, ArrowRight } from 'lucide-react';

export default function KatalogDonasiPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const WA_NUMBER = "6282262170018";

  useEffect(() => {
    DonationService.getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const generateWaLink = (productTitle: string) => {
    const message = `Assalamu'alaikum Admin KajianQu, saya ingin bertanya/memesan produk kebaikan: *${productTitle}*.\n\nMohon informasi lebih lanjut.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      {/* Header Banner */}
      <div className="bg-[#1D794E] pt-20 pb-28 px-6 rounded-b-[64px] shadow-2xl relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20">
            <Heart size={14} className="text-emerald-300 fill-emerald-300" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Program Berbagi</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Katalog Kebaikan
          </h1>
          <p className="text-emerald-50/60 text-sm max-w-xl mx-auto font-medium">
            Pilih program donasi atau produk kebaikan untuk membantu sesama. Setiap transaksi adalah investasi akhirat.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-1">Mulai Dari</p>
                    <p className="text-lg font-black text-emerald-600 leading-none">{product.price_label}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-8">
                    <h3 className="text-2xl font-black text-emerald-900 leading-tight group-hover:text-emerald-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Link WhatsApp Dinamis */}
                    <a 
                      href={generateWaLink(product.title)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#1D794E] text-white rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 hover:bg-[#155d3c] hover:scale-[1.02] transition-all"
                    >
                      <MessageCircle size={18} fill="currentColor" /> Beli via WhatsApp
                    </a>
                    <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                      Lihat Detail Program <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[48px] border-2 border-dashed border-gray-100">
             <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="font-black text-gray-300 uppercase tracking-[0.3em]">Katalog Sedang Kosong</p>
          </div>
        )}
      </div>
    </div>
  );
}