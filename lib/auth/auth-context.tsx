import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/router'
import { Session, User } from '@supabase/supabase-js'
import { logger } from '@/lib/debug'
import { AUTH_ROUTES } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
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

    const isAuthPage = router.pathname.startsWith(AUTH_ROUTES.login) || 
                      router.pathname.startsWith(AUTH_ROUTES.register)

    if (!user && !isAuthPage) {
      navigate(AUTH_ROUTES.login)
    } else if (user && isAuthPage) {
      navigate(AUTH_ROUTES.dashboard)
    }
  }, [user, loading, router.pathname, navigate])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) return { error }

      setUser(data.user)
      setSession(data.session)

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
      navigate(AUTH_ROUTES.login)
    } catch (error) {
      logger.error('Error signing out:', error)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) return { error }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut, signIn, signUp, loading }}>
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