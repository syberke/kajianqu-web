import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeInternalPath } from '@/lib/navigation/safe-redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedDestination = searchParams.get('next')
  const safeDestination = requestedDestination ? safeInternalPath(requestedDestination) : null

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      if (safeDestination) return NextResponse.redirect(`${origin}${safeDestination}`)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      const destination = profile?.role === 'admin'
        ? '/dashboard/admin'
        : profile?.role === 'asatidz'
          ? '/dashboard/asatidz'
          : '/welcome'

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`)
}
