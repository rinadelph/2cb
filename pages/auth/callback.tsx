import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AUTH_ROUTES } from '@/lib/auth'
import { logger } from '@/lib/debug'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        router.push(AUTH_ROUTES.dashboard)
      } catch (error) {
        logger.error('Auth callback error:', error)
        router.push(AUTH_ROUTES.login)
      }
    }

    handleRedirect()
  }, [router, supabase.auth])

  return null
}
