import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authLogger } from './lib/auth/auth-logger';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if exists
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  authLogger.debug('Middleware session check:', {
    hasSession: !!session,
    sessionUser: session?.user?.email,
    error: error?.message
  });

  if (session) {
    // Refresh the session
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
    authLogger.info('Session refreshed:', {
      user: refreshedSession?.user?.email,
      expiresAt: refreshedSession?.expires_at
    });
  }

  return res;
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
}; 