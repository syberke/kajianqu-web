import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/require-admin'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keilmuan = await db.keilmuan.findMany({
    orderBy: { nama: 'asc' },
    select: { id: true, nama: true },
  })

  return NextResponse.json({ keilmuan })
}
