import { createClient } from '@supabase/supabase-js';

interface ErrorWithDetails {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side singleton instance (using anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (only for trusted server operations)
const getServiceClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get appropriate client based on context
export function getSupabaseClient(context?: 'server' | 'test') {
  // Only use service role key in server context when explicitly requested
  if (context === 'server' && process.env.NODE_ENV !== 'production') {
    try {
      return getServiceClient();
    } catch (error) {
      console.warn('Failed to get service client, falling back to anon client:', error);
      return supabase;
    }
  }
  
  // For test operations in non-production
  if (context === 'test' && process.env.NODE_ENV !== 'production') {
    try {
      return getServiceClient();
    } catch (error) {
      console.warn('Failed to get service client for test, falling back to anon client:', error);
      return supabase;
    }
  }

  return supabase;
}

// Export the client-side singleton instance
export { supabase };

export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const logError = (message: string, error: Error | ErrorWithDetails | unknown) => {
  console.error(`[ERROR] ${message}:`, error);
  if (error && typeof error === 'object') {
    const err = error as ErrorWithDetails;
    if (err.message) console.error('Error message:', err.message);
    if (err.details) console.error('Error details:', err.details);
    if (err.hint) console.error('Error hint:', err.hint);
    if (err.code) console.error('Error code:', err.code);
  }
};

export const logInfo = (message: string, data?: unknown) => {
  console.log(`[INFO] ${message}`, data ? data : '');
};
