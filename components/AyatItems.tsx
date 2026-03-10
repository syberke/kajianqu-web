
import { Play, Pause, Bookmark, BookOpen } from 'lucide-react';

interface AyatProps {
  ayat: any;
  isPlaying: boolean;
  isBookmarked: boolean;
  onPlay: (num: number) => void;
  onBookmark: () => void;
}

export const AyatItem = ({ ayat, isPlaying, isBookmarked, onPlay, onBookmark }: AyatProps) => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all mb-4">
      <div className="flex justify-between items-center mb-6">
        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm">
          {ayat.numberInSurah}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => onPlay(ayat.number)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            onClick={onBookmark}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
          >
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <p className="text-3xl leading-[3rem] text-right font-arabic text-slate-800 mb-6" dir="rtl">
        {ayat.text}
      </p>
      
      <div className="space-y-3">
        <p className="text-emerald-700 font-medium leading-relaxed">{ayat.translation}</p>
        <div className="p-4 bg-slate-50 rounded-xl flex gap-3">
          <BookOpen size={18} className="text-slate-400 shrink-0 mt-1" />
          <p className="text-sm text-slate-500 italic leading-relaxed">{ayat.tafsir}</p>
        </div>
      </div>
    </div>
  );
};