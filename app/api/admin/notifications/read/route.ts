import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: Request
) {
  try {
    const { id } =
      await request.json()

    const supabaseAdmin =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .SUPABASE_SERVICE_ROLE_KEY!
      )

    const { error } =
      await supabaseAdmin
        .from('notifications')
        .update({
          is_read: true
        })
        .eq('id', id)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}