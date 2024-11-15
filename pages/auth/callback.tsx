import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        router.push('/dashboard')
      } catch (error) {
        router.push('/auth/login')
      }
    }

    handleRedirect()
  }, [router, supabase.auth])

  return null
}
