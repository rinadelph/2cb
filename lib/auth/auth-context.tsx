import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'

// Simplified context type to match actual implementation
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== Auth Provider Initializing ===');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('=== Initial Session ===', {
        hasSession: !!session,
        user: session?.user?.email
      });
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('=== Auth State Change ===', {
        event,
        user: session?.user?.email
      });
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log('=== Auth Provider State ===', {
    hasUser: !!user,
    isLoading,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
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
} 