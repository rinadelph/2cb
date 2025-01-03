import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/lib/routes';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Check if it's a public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return res;
  }

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access protected route
  if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 