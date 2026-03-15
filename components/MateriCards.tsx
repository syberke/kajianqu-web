import Link from 'next/link';

export interface MateriProps {
  title: string;
  category: string;
  book: string;
  thumbnail: string;
  id: string;
}

export const MateriCard = ({ title, category, book, thumbnail, id }: MateriProps) => {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
      <div className="relative h-48 w-full">
        <img src={thumbnail || 'https://images.unsplash.com/photo-1584281723350-2382e3d7a64a?q=80&w=800'} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{category}</p>
        <h3 className="font-black text-emerald-900 text-lg leading-tight mb-2 min-h-[3rem] line-clamp-2">{title}</h3>
        <p className="text-xs text-gray-400 mb-4 italic">Kitab: {book}</p>
        
        <Link href={`/dashboard/siswa/keilmuan/${id}`}>
          <button className="w-full py-3 bg-[#1D794E] text-white rounded-2xl text-[10px] tracking-widest font-black hover:bg-emerald-800 transition-all">
            PELAJARI MATERI
          </button>
        </Link>
      </div>
    </div>
  );
};