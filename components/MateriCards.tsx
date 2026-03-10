
import Link from 'next/link';

export interface MateriProps {
  title: string;
  category: string;
  book: string;
  thumbnail: string;
  slug: string; 
}

export const MateriCard = ({ title, category, book, thumbnail, slug }: MateriProps) => {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
      <div className="relative h-48 w-full">
        <img src={thumbnail || '/placeholder.jpg'} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{category}</p>
        <h3 className="font-black text-emerald-900 text-lg leading-tight mb-2">{title}</h3>
        <p className="text-xs text-gray-400 mb-4 italic">Kitab: {book}</p>
        
      
        <Link href={`/dashboard/user/materi/${slug}`}>
          <button className="w-full py-3 bg-[#1D794E] text-white rounded-2xl text-xs font-black hover:bg-emerald-800 transition-colors">
            PELAJARI MATERI
          </button>
        </Link>
      </div>
    </div>
  );
};