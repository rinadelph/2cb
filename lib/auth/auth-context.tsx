import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/router'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { debounce } from 'lodash'
import { authLogger } from '@/lib/auth/auth-logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
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
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        // Listen for auth changes with proper types
        const handleAuthChange = debounce((
          event: AuthChangeEvent, 
          session: Session | null
        ) => {
          authLogger.info('Supabase auth state changed:', { 
            event, 
            user: session?.user?.email 
          });
          setUser(session?.user || null);
          setSession(session);
          setLoading(false);
        }, 300);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

        setLoading(false)
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Handle auth state changes and navigation
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Only redirect to login if we're not already on an auth page
        const isAuthPage = window.location.pathname.startsWith('/login') || 
                          window.location.pathname.startsWith('/signup')
        if (!isAuthPage) {
          router.push('/login')
        }
      } else {
        // Only redirect to dashboard if we're on an auth page
        const isAuthPage = window.location.pathname.startsWith('/login') || 
                          window.location.pathname.startsWith('/signup')
        if (isAuthPage) {
          router.push('/dashboard')
        }
      }
    }
  }, [user, loading, router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut, loading }}>
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