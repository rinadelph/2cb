import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCurrentUser, isEmailVerified } from '../lib/auth'

export function useAuth(requireVerification = true) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          if (requireVerification) {
            const verified = await isEmailVerified()
            if (!verified) {
              router.push('/auth/verify-email')
              return
            }
          }
          setUser(currentUser)
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth check failed', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireVerification, router])

  return { user, loading }
}