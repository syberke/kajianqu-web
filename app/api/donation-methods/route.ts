import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

export async function GET() {
  const methods = await db.donationMethod.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    methods: methods.map((method) => ({
      id: method.id,
      method_type: method.methodType,
      bank_name: method.bankName,
      account_number: method.accountNumber,
      account_name: method.accountName,
      qris_image_url: method.qrisImageUrl,
    })),
  })
}
