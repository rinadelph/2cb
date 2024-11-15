import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useRouter } from 'next/router'
import { logger } from '@/lib/debug'

export function useSessionRecovery() {
  const { recoverSession } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const recover = async () => {
      try {
        const session = await recoverSession()
        if (session) {
          logger.info('Session recovered automatically', {
            userId: session.user.id
          })
          router.push('/dashboard')
        }
      } catch (err) {
        logger.error('Error recovering session:', err)
      }
    }

    recover()
  }, [])
} 