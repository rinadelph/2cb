import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { authLogger } from '@/lib/auth/auth-logger'

export function useSessionRecovery() {
  const { recoverSession, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const recover = async () => {
      const { error } = await recoverSession()

      if (error) {
        authLogger.error('Failed to recover session', { error })
        return
      }

      if (user) {
        authLogger.info('Session recovered automatically', {
          userId: user.id
        })
        router.push('/dashboard')
      }
    }

    recover()
  }, [recoverSession, router, user])
} 