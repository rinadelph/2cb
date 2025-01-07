import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/constants'

export interface SessionInfo {
  id: string;
  created_at: string;
  last_active: string;
  user_agent?: string;
  ip_address?: string;
  current: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  getActiveSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<{ error: Error | null }>;
  recoverSession: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<{ error: Error | null }>;
  updateProfile: (data: { [key: string]: any }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  deleteAccount: async () => ({ error: null }),
  getActiveSessions: async () => [],
  revokeSession: async () => ({ error: null }),
  recoverSession: async () => ({ error: null }),
  refreshSession: async () => ({ error: null }),
  updateProfile: async () => ({ error: null })
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push(AUTH_ROUTES.dashboard);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push(AUTH_ROUTES.login);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) throw new Error('No user logged in');

      // Delete user data first
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) throw authError;

      // Sign out after deletion
      await signOut();

      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error: error as Error };
    }
  };

  const getActiveSessions = async (): Promise<SessionInfo[]> => {
    try {
      if (!session) return [];

      return [{
        id: session.access_token,
        created_at: new Date(session.expires_at! * 1000).toISOString(),
        last_active: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        current: true
      }];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      if (!session) throw new Error('No active session');

      if (sessionId === session.access_token) {
        await signOut();
      }

      return { error: null };
    } catch (error) {
      console.error('Error revoking session:', error);
      return { error: error as Error };
    }
  };

  const recoverSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
      }

      return { error: null };
    } catch (error) {
      console.error('Error recovering session:', error);
      return { error: error as Error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (refreshedSession) {
        setUser(refreshedSession.user);
        setSession(refreshedSession);
      }

      return { error: null };
    } catch (error) {
      console.error('Error refreshing session:', error);
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: { [key: string]: any }) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.auth.updateUser({
        data
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      getActiveSessions,
      revokeSession,
      recoverSession,
      refreshSession,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 