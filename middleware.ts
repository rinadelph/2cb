import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/debug';
import { AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/lib/auth';

// Add matcher configuration to optimize middleware execution
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value ?? '',
        set: (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Check if it's a public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return res;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If accessing protected route without auth
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !session) {
      logger.info('Unauthorized access attempt', {
        path: pathname,
        timestamp: new Date().toISOString()
      });

      const redirectUrl = new URL(AUTH_ROUTES.login, req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    logger.error('Middleware error:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/404';
    return NextResponse.redirect(url);
  }
} 