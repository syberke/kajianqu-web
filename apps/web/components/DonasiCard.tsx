import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Props {
  slug: string;
  title: string;
  desc: string;
}

export default function DonasiCard({ slug, title, desc }: Props) {
  return (
    <Link 
      href={`/donasi/${slug}`}
      className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group"
    >
      <div>
        <h4 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
        <ChevronRight size={18} />
      </div>
    </Link>
  );
}