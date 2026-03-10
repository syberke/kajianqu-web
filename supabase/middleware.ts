import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
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
    const userRole = user.user_metadata?.role 

    if (path.startsWith('/asatidz') && userRole !== 'asatidz') {
      url.pathname = '/' 
      return NextResponse.redirect(url)
    }


    if (path.startsWith('/admin') && userRole !== 'admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (path === '/login' || path === '/register') {
      url.pathname = '/dashboard' 
      return NextResponse.redirect(url)
    }
  } else {

    const protectedPaths = ['/dashboard', '/asatidz', '/profile', '/tahsin']
    if (protectedPaths.some(p => path.startsWith(p))) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return response
}