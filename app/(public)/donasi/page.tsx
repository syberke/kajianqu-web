import React from 'react';
import DonasiHeader from '../../../components/DonasiHeader';
import DonasiCard from '../../../components/DonasiCard';
import { categories } from './data/donasi';

export default function DonasiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DonasiHeader title="Pusat Donasi KajianQu" />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Pilih Program Kebaikan</h2>
          <p className="text-gray-500">Salurkan kepedulian Anda untuk umat melalui program-program kami</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <DonasiCard 
              key={cat.id}
              slug={cat.slug}
              title={cat.title}
              desc={cat.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}