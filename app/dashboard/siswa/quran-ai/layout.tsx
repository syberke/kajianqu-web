// app/quran-ai/layout.tsx
import Link from 'next/link'
import { BookOpen, Mic, HelpCircle } from 'lucide-react'

export default function QuranAILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="flex gap-1 py-2">
            <Link
              href="/quran-ai/tahfidz"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <BookOpen size={14} />
              Tahfidz
            </Link>
            <Link
              href="/quran-ai/tahsin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <Mic size={14} />
              Tahsin
            </Link>
            <Link
              href="/quran-ai/quiz"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
            >
              <HelpCircle size={14} />
              Quiz
            </Link>
          </nav>
        </div>
      </div>
      <main className="py-4">{children}</main>
    </div>
  )
}