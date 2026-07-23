import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get('limit') ?? 10)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50) : 10

  const rows = await db.quranMistake.groupBy({
    by: ['wordArabic', 'surahId', 'ayahNumber'],
    where: {
      userId: user.id,
      wordArabic: { not: '' },
    },
    _count: { _all: true },
  })

  return NextResponse.json({
    mistakes: rows
      .map((row) => ({
        word: row.wordArabic,
        surahId: row.surahId,
        ayahNumber: row.ayahNumber,
        count: row._count._all,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, limit),
  })
}
