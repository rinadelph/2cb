"use client"

import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logger } from '@/lib/debug'
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/auth'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSessionTimeout()
  const pathname = usePathname()

  useEffect(() => {
    // Only log path changes for authenticated routes
    if (!PUBLIC_ROUTES.includes(pathname)) {
      logger.debug('Navigation to protected route', { pathname })
    }
  }, [pathname])

  return <>{children}</>
} 