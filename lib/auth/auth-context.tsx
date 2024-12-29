import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/router'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { debounce } from 'lodash'
import { authLogger } from '@/lib/auth/auth-logger'
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
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info('Initializing auth context')
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        logger.info('Initial session loaded:', { 
          hasSession: !!initialSession,
          user: initialSession?.user?.email 
        })
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        // Listen for auth changes with proper types
        const handleAuthChange = debounce((
          event: AuthChangeEvent, 
          session: Session | null
        ) => {
          logger.info('Auth state change detected:', { 
            event, 
            user: session?.user?.email,
            path: window.location.pathname
          })
          setUser(session?.user || null)
          setSession(session)
          setLoading(false)
        }, 300)

        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

        setLoading(false)
        return () => {
          logger.info('Cleaning up auth subscriptions')
          subscription.unsubscribe()
        }
      } catch (error) {
        logger.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Handle auth state changes and navigation
  useEffect(() => {
    logger.info('Auth state changed:', { 
      hasUser: !!user, 
      loading,
      path: window.location.pathname
    })

    if (!loading) {
      const currentPath = window.location.pathname
      const isAuthPage = currentPath.startsWith('/login') || 
                        currentPath.startsWith('/signup') ||
                        currentPath.startsWith('/auth/')

      logger.info('Checking navigation:', {
        currentPath,
        isAuthPage,
        hasUser: !!user
      })

      if (!user && !isAuthPage) {
        logger.info('Redirecting to login - no user')
        router.push('/login')
      } else if (user && isAuthPage) {
        logger.info('Redirecting to dashboard - user authenticated')
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Sign in attempt:', { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        logger.error('Sign in failed:', error)
        return { error }
      }

      logger.info('Sign in successful:', { 
        user: data.user?.email,
        path: window.location.pathname
      })
      setUser(data.user)
      setSession(data.session)
      return { error: null }
    } catch (error) {
      logger.error('Unexpected error during sign in:', error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      logger.info('Sign out initiated')
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push('/login')
      logger.info('Sign out successful')
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