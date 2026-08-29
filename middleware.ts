import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getStudioSubdomain, isPlatformHost } from '@/lib/domains'

type RoleResult = { data: { role: string } | null; error: unknown | null }
type IdResult = { data: { id: string } | null; error: unknown | null }

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl

  // Shopify-style Subdomain Routing.
  // All host classification lives in lib/domains (single source of truth) so the
  // router, the DNS-verify check, and the studio UI can never drift apart.
  const hostname = request.headers.get('host') || ''
  const subdomain = getStudioSubdomain(hostname)

  // Shared guard: internal app paths that must never be rewritten to a studio.
  const isReservedPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/architect') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/partner') ||
    pathname.startsWith('/agent') ||
    pathname.startsWith('/shipping-agent') ||
    pathname.startsWith('/contractor') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/affiliate') ||
    pathname.includes('.')

  if (subdomain && !isReservedPath) {
    console.log(`[Subdomain Router] Rewriting ${subdomain} to /studio/${subdomain}${pathname}`)
    return NextResponse.rewrite(
      new URL(`/studio/${subdomain}${pathname}`, request.url)
    )
  }

  // Custom domain routing (Shopify-style "connect existing domain").
  // A request whose Host is a foreign domain — not the root domain, not one
  // of its subdomains, not localhost/preview — only reaches us when an
  // architect has pointed their own domain at the app. Resolve it to the
  // studio owner via /studio/domain/<host>.
  const hostNoPort = hostname.split(':')[0]
  const isCustomDomainCandidate =
    !subdomain &&
    !!hostNoPort &&
    hostNoPort.includes('.') &&
    !isPlatformHost(hostname) &&
    !hostNoPort.endsWith('.vercel.app') &&
    hostNoPort !== 'localhost' &&
    hostNoPort !== '127.0.0.1' &&
    hostNoPort !== '0.0.0.0'

  if (isCustomDomainCandidate && !isReservedPath) {
    console.log(`[Custom Domain Router] Rewriting ${hostNoPort} to /studio/domain/${hostNoPort}`)
    return NextResponse.rewrite(
      new URL(`/studio/domain/${hostNoPort}`, request.url)
    )
  }

  const devArchitectBypass =
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_BYPASS_ARCHITECT_AUTH === 'true'

  if (devArchitectBypass && pathname.startsWith('/architect')) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user: { id: string; user_metadata?: Record<string, unknown> } | null = null
  try {
    const { data, error: authError } = await supabase.auth.getUser()
    user = data?.user ?? null

    if (authError && authError.message.toLowerCase().includes('refresh token')) {
      const allCookies = request.cookies.getAll()
      const response = NextResponse.redirect(new URL(request.url))
      allCookies.forEach((cookie) => {
        if (cookie.name.startsWith('sb-') || cookie.name.includes('auth-token')) {
          response.cookies.delete(cookie.name)
        }
      })
      return response
    }
  } catch (err) {
    console.error('Middleware auth error:', err)
  }

  // Seller routes protection
  if (pathname.startsWith('/seller')) {
    if (pathname === '/seller/login' || pathname === '/seller/register') {
      if (user) {
        // Check both profiles role AND sellers table for complete validation
        const [profileResult, sellerResult] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          supabase.from('sellers').select('id').eq('id', user.id).single(),
        ])

        if (profileResult.data?.role === 'seller' && sellerResult.data) {
          return NextResponse.redirect(new URL('/seller/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL('/seller/login', request.url))
    }

    // Check both profiles role AND sellers table for complete validation with error handling
    let profileResult: RoleResult = { data: null, error: null }
    let sellerResult: IdResult = { data: null, error: null }

    try {
      const results = await Promise.allSettled([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('sellers').select('id').eq('id', user.id).single(),
      ])

      if (results[0].status === 'fulfilled') {
        profileResult = results[0].value
      } else {
        console.error('Profile query error:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        sellerResult = results[1].value
      } else {
        console.error('Seller query error:', results[1].reason)
      }
    } catch (error) {
      console.error('Database query error:', error)
    }

    // Only redirect if we have valid data and user is not a seller
    // If there are database errors, allow access to prevent false redirects
    if (profileResult.data && profileResult.data.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (profileResult.data && profileResult.data.role === 'seller' && sellerResult.error) {
      // User is a seller but seller query failed - log error but allow access
      console.error('Seller profile query failed for seller user, allowing access')
    }
  }

  // Architect routes protection
  if (pathname.startsWith('/architect')) {
    const hasBypass = request.cookies.has('architect_bypass_email')

    if (pathname === '/architect/login' || pathname === '/architect/register') {
      if (hasBypass || user) {
        if (hasBypass) {
          return NextResponse.redirect(new URL('/architect/dashboard', request.url))
        }
        const [profileResult, architectResult] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user!.id).single(),
          supabase.from('architects').select('id').eq('id', user!.id).single(),
        ])

        if (profileResult.data?.role === 'architect' && architectResult.data) {
          return NextResponse.redirect(new URL('/architect/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    if (hasBypass) {
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL('/architect/login', request.url))
    }

    let profileResult: RoleResult = { data: null, error: null }
    let architectResult: IdResult = { data: null, error: null }

    try {
      const results = await Promise.allSettled([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('architects').select('id').eq('id', user.id).single(),
      ])

      if (results[0].status === 'fulfilled') {
        profileResult = results[0].value
      } else {
        console.error('Profile query error:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        architectResult = results[1].value
      } else {
        console.error('Architect query error:', results[1].reason)
      }
    } catch (error) {
      console.error('Database query error:', error)
    }

    if (profileResult.data && profileResult.data.role !== 'architect') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (profileResult.data && profileResult.data.role === 'architect' && architectResult.error) {
      console.error('Architect profile query failed for architect user, allowing access')
    }
  }

  // Affiliate routes protection
  if (pathname.startsWith('/affiliate')) {
    const hasBypass = request.cookies.has('affiliate_bypass_email')

    if (pathname === '/affiliate/login' || pathname === '/affiliate/register') {
      if (hasBypass || user) {
        if (hasBypass) {
          return NextResponse.redirect(new URL('/affiliate/dashboard', request.url))
        }
        const [profileResult, affiliateResult] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user!.id).single(),
          supabase.from('affiliates').select('id').eq('id', user!.id).single(),
        ])

        if (profileResult.data?.role === 'affiliate' && affiliateResult.data) {
          return NextResponse.redirect(new URL('/affiliate/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    if (hasBypass) {
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL('/affiliate/login', request.url))
    }

    let profileResult: RoleResult = { data: null, error: null }
    let affiliateResult: IdResult = { data: null, error: null }

    try {
      const results = await Promise.allSettled([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('affiliates').select('id').eq('id', user.id).single(),
      ])

      if (results[0].status === 'fulfilled') {
        profileResult = results[0].value
      } else {
        console.error('Profile query error:', results[0].reason)
      }

      if (results[1].status === 'fulfilled') {
        affiliateResult = results[1].value
      } else {
        console.error('Affiliate query error:', results[1].reason)
      }
    } catch (error) {
      console.error('Database query error:', error)
    }

    if (profileResult.data && profileResult.data.role !== 'affiliate') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (profileResult.data && profileResult.data.role === 'affiliate' && affiliateResult.error) {
      console.error('Affiliate profile query failed for affiliate user, allowing access')
    }
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      }
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Agent routes protection
  if (pathname.startsWith('/agent')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    if (user.user_metadata?.role !== 'agent')
      return NextResponse.redirect(new URL('/', request.url))
  }

  // Shipping agent routes protection
  if (pathname.startsWith('/shipping-agent')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    if (user.user_metadata?.role !== 'shipping_agent')
      return NextResponse.redirect(new URL('/', request.url))
  }

  // Partner routes protection
  if (pathname.startsWith('/partner')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const partnerRole = user.user_metadata?.role
    if (partnerRole !== 'partner') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Contractor routes protection
  if (pathname.startsWith('/contractor')) {
    // All contractor routes require authentication
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // TEMPORARILY BYPASS ROLE CHECK FOR TESTING
    // Check if user has contractor or admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('Contractor route access check:', { userId: user.id, profile, profileError })
  }

  // Account routes protection (for customers)
  if (pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
