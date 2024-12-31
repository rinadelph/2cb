import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/router'
import { Session, User } from '@supabase/supabase-js'
import { logger } from '@/lib/debug'
import { AUTH_ROUTES } from '@/lib/auth'
import { SessionInfo } from '@/types/auth'

interface AuthResponse {
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  getActiveSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  recoverSession: () => Promise<Session | null>;
  refreshSession: () => Promise<Session | null>;
  updateProfile: (data: { [key: string]: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  deleteAccount: async () => {},
  getActiveSessions: async () => [],
  revokeSession: async () => {},
  recoverSession: async () => null,
  refreshSession: async () => null,
  updateProfile: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)

          if (event === 'SIGNED_IN') {
            // Handle sign in
            logger.info('User signed in')
          } else if (event === 'SIGNED_OUT') {
            // Handle sign out
            logger.info('User signed out')
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const deleteAccount = async () => {
    if (!user) throw new Error('No user to delete')
    const { error } = await supabase.rpc('delete_user')
    if (error) throw error
    await signOut()
  }

  const getActiveSessions = async () => {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const sessions: SessionInfo[] = [{
      id: currentSession?.access_token || '',
      deviceInfo: {
        type: 'desktop' as const,
        browser: 'Unknown',
        os: 'Unknown'
      },
      lastActive: new Date().toISOString(),
      current: true,
    }]

    return sessions
  }

  const revokeSession = async (sessionId: string) => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const recoverSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return session
  }

  const updateProfile = async (data: { [key: string]: any }) => {
    const { error } = await supabase.auth.updateUser({
      data
    })
    if (error) throw error
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    deleteAccount,
    getActiveSessions,
    revokeSession,
    recoverSession,
    refreshSession,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 