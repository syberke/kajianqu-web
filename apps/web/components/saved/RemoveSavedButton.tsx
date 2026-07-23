'use client'

import { useRouter } from 'next/navigation'
import { BookmarkX, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

export default function RemoveSavedButton({ targetType, targetId }: { targetType: 'asatidz' | 'privateClass' | 'material'; targetId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  return <button type="button" disabled={loading} onClick={async () => { setLoading(true); const response = await fetch('/api/saved-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId }) }); if (response.ok) router.refresh(); else setLoading(false) }} className="flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50">{loading ? <LoaderCircle className="animate-spin" size={15} /> : <BookmarkX size={15} />}Hapus</button>
}
