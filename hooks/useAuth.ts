import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/router'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/debug'
import { AuthConfig } from '@/types/auth'
import { getSessionDuration } from '@/lib/auth/session-config'
import { SessionStorage } from '@/lib/auth/session-storage'
import { CookieManager } from '@/lib/auth/cookie-manager'

interface DeleteAccountOptions {
  feedback?: string;
  deleteData?: boolean;
}

export function useAuth() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  const signInWithEmail = async (
    email: string, 
    password: string, 
    config?: AuthConfig
  ) => {
    try {
      logger.authAttempt(email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data?.user) {
        logger.authSuccess(data.user.id, email)
        
        // Handle remember me with secure cookies
        if (config?.rememberMe) {
          SessionStorage.setRememberMe(true)
          await SessionStorage.persistSession(data.session!)
          CookieManager.setSessionCookie(data.session!.access_token, true)
        } else {
          CookieManager.setSessionCookie(data.session!.access_token, false)
        }
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
        
        await router.push('/dashboard')
      }

      return { data, error }
    } catch (err) {
      logger.error('Error in signInWithEmail:', err)
      return { 
        data: null, 
        error: new Error('Failed to sign in') 
      }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (!error) {
        logger.info('Sign up successful, verification email sent', { email })
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        })
        await router.push('/auth/verify-email')
      }

      return { data, error }
    } catch (err) {
      logger.error('Error in signUp:', err)
      return { 
        data: null, 
        error: new Error('Failed to sign up') 
      }
    }
  }

  const recoverSession = async () => {
    try {
      const rememberMe = localStorage.getItem('rememberMe') === 'true'
      if (!rememberMe) {
        logger.debug('No remembered session found')
        return null
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        logger.error('Error recovering session:', error)
        return null
      }

      if (session?.user) {
        logger.info('Session recovered', { userId: session.user.id })
        return session
      }

      return null
    } catch (err) {
      logger.error('Error in recoverSession:', err)
      return null
    }
  }

  const clearRememberedSession = () => {
    try {
      localStorage.removeItem('rememberMe')
      logger.info('Remembered session cleared')
    } catch (err) {
      logger.error('Error clearing remembered session:', err)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        // Clear all auth-related storage
        SessionStorage.clearSession()
        CookieManager.clearAllAuthCookies()
        
        logger.info('Sign out successful')
        await router.push('/auth/login')
      }

      return { error }
    } catch (err) {
      logger.error('Error in signOut:', err)
      return { 
        error: new Error('Failed to sign out') 
      }
    }
  }

  // Add session management methods
  const getCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        logger.sessionActivity(session.user.id, 'session_checked')
      }
      return { session, error }
    } catch (err) {
      logger.error('Error getting current session:', err)
      return { session: null, error: err as Error }
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (session?.user) {
        logger.sessionActivity(session.user.id, 'session_refreshed')
      }
      return { session, error }
    } catch (err) {
      logger.error('Error refreshing session:', err)
      return { session: null, error: err as Error }
    }
  }

  // Add method to get all active sessions
  const getActiveSessions = async () => {
    try {
      // This is a placeholder - you'll need to implement the API endpoint
      const response = await fetch('/api/auth/sessions')
      const data = await response.json()
      return { data, error: null }
    } catch (err) {
      logger.error('Error getting active sessions:', err)
      return { data: null, error: err as Error }
    }
  }

  // Add method to revoke a specific session
  const revokeSession = async (sessionId: string) => {
    try {
      // This is a placeholder - you'll need to implement the API endpoint
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      return { data, error: null }
    } catch (err) {
      logger.error('Error revoking session:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteAccount = async (feedback?: string) => {
    try {
      logger.info('Account deletion initiated', { feedback })

      // First, get current session to verify user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError

      if (!session?.user) {
        throw new Error('No active session found')
      }

      // Start deletion process
      const { error } = await supabase.functions.invoke('delete-account', {
        body: {
          userId: session.user.id,
          feedback,
          timestamp: new Date().toISOString()
        }
      })

      if (error) throw error

      // Clear all local data
      SessionStorage.clearSession()
      CookieManager.clearAllAuthCookies()

      logger.info('Account deletion scheduled', {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })

      return { error: null }
    } catch (err) {
      logger.error('Error in deleteAccount:', err)
      return { 
        error: err instanceof Error ? err : new Error('Failed to delete account')
      }
    }
  }

  return {
    signInWithEmail,
    signUp,
    signOut,
    getCurrentSession,
    refreshSession,
    getActiveSessions,
    revokeSession,
    recoverSession,
    clearRememberedSession,
    deleteAccount,
  }
}
