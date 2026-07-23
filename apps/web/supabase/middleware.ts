import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )


  const { data: { user } } = await supabase.auth.getUser()


  const url = request.nextUrl.clone()
  const path = url.pathname


  if (user) {
    if (path === '/login' || path.startsWith('/register')) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } else {
    const protectedPaths = ['/dashboard', '/profile', '/quran', '/quran-ai', '/sahabat-quran']
    if (protectedPaths.some(p => path.startsWith(p))) {
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
  }

  return response
}
