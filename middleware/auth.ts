import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/debug'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/listings/create',
  '/listings/manage',
  '/listings/edit',
  '/settings'
] as const

const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/reset-password',
  '/auth/update-password',
  '/auth/verify-email',
  '/404'
] as const

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { pathname } = req.nextUrl

  // Check if it's a public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return res
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If accessing protected route without auth
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !session) {
      logger.warn('Unauthorized access attempt', {
        path: pathname,
        timestamp: new Date().toISOString()
      })

      // Redirect to 404 instead of login
      const url = req.nextUrl.clone()
      url.pathname = '/404'
      return NextResponse.redirect(url)
    }

    return res
  } catch (error) {
    logger.error('Middleware error:', error)
    // On error, redirect to 404
    const url = req.nextUrl.clone()
    url.pathname = '/404'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
