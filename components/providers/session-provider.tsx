"use client"

import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logger } from '@/lib/debug'

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify-email',
]

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSessionTimeout()
  const pathname = usePathname()

  useEffect(() => {
    // Only log path changes for authenticated routes
    if (!PUBLIC_PATHS.includes(pathname)) {
      logger.debug('Navigation to protected route', { pathname })
    }
  }, [pathname])

  return <>{children}</>
} 