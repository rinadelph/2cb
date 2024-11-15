import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/debug';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname, searchParams } = req.nextUrl;

  logger.debug('Middleware processing request', { 
    pathname, 
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle auth error redirects
  if (pathname === '/auth/update-password' && searchParams.has('error')) {
    logger.warn('Auth error detected', {
      error: searchParams.get('error'),
      error_description: searchParams.get('error_description'),
      pathname
    });

    const url = req.nextUrl.clone();
    url.pathname = '/auth/error';
    url.search = searchParams.toString();
    return NextResponse.redirect(url);
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Log session status
    logger.debug('Session check', {
      hasSession: !!session,
      pathname,
      userId: session?.user?.id
    });

    // Add your protected routes logic here
    const protectedRoutes = ['/dashboard', '/settings'];
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
      logger.warn('Unauthorized access attempt', {
        path: pathname,
        timestamp: new Date().toISOString(),
        headers: {
          referer: req.headers.get('referer'),
          userAgent: req.headers.get('user-agent')
        }
      });

      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Log successful middleware completion
    logger.debug('Middleware completed', {
      pathname,
      status: 'success'
    });

    return res;
  } catch (error) {
    logger.error('Middleware error:', error, {
      pathname,
      headers: {
        referer: req.headers.get('referer'),
        userAgent: req.headers.get('user-agent')
      }
    });
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 