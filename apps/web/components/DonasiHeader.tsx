import React from 'react';

interface Props {
  title: string;
  bgImage?: string;
  breadcrumb?: string;
}

export default function DonasiHeader({ title, bgImage, breadcrumb }: Props) {
  return (
    <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${bgImage || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200'})` }}
      />
      <div className="absolute inset-0 bg-emerald-900/80" />
      
      <div className="relative z-10 text-center text-white px-4">
        <p className="text-sm md:text-base mb-2 font-medium text-emerald-200 uppercase tracking-widest">
          Program Donasi
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-200">
          Perbanyak pahala dengan amal jariyah, dengan salah satu program donasi kami yaitu {title}.
        </p>
      </div>
    </div>
  );
}