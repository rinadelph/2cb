"use client"

import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logger } from '@/lib/debug'
import { PUBLIC_ROUTES, type PublicRoute } from '@/lib/routes'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSessionTimeout()
  const pathname = usePathname()

  useEffect(() => {
    // Only log path changes for authenticated routes
    if (pathname && !PUBLIC_ROUTES.includes(pathname as PublicRoute)) {
      logger.debug('Navigation to protected route', { pathname })
    }
  }, [pathname])

  return <>{children}</>
} 