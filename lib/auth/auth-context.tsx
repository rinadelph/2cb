import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/router'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { debounce } from 'lodash'
import { logger } from '@/lib/debug'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigationInProgress = useRef(false)
  const router = useRouter()

  const navigate = useCallback((path: string) => {
    if (navigationInProgress.current) return
    navigationInProgress.current = true
    
    router.push(path).finally(() => {
      navigationInProgress.current = false
    })
  }, [router])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info('Initializing auth context')
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession) {
          setUser(initialSession.user)
          setSession(initialSession)
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            logger.info('Auth state change:', { event, user: session?.user?.email })
            setUser(session?.user || null)
            setSession(session)
          }
        )

        setLoading(false)
        return () => subscription.unsubscribe()
      } catch (error) {
        logger.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (loading || navigationInProgress.current) return

    const isAuthPage = router.pathname.startsWith('/login') || 
                      router.pathname.startsWith('/signup') ||
                      router.pathname.startsWith('/auth/')

    if (!user && !isAuthPage) {
      navigate('/login')
    } else if (user && isAuthPage) {
      navigate('/dashboard')
    }
  }, [user, loading, router.pathname, navigate])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) return { error }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      navigate('/login')
    } catch (error) {
      logger.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut, signIn, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 