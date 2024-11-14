import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { logger } from '@/lib/debug'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      router.push('/dashboard')
    } catch (err) {
      logger.error('Login error:', err)
      throw err
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
    } catch (err) {
      logger.error('Registration error:', err)
      throw err
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
