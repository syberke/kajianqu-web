import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', {
        ascending: false
      })
      .limit(20)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        {
          status: 500
        }
      )
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
      unreadCount:
        data?.filter(
          item => !item.is_read
        ).length || 0
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    )
  }
}