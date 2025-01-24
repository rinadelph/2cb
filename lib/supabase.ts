import { createClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};

export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

interface ErrorWithDetails {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const logError = (message: string, error: Error | PostgrestError | ErrorWithDetails) => {
  console.error(`[ERROR] ${message}:`, error);
  if ('message' in error) console.error('Error message:', error.message);
  if ('details' in error) console.error('Error details:', error.details);
  if ('hint' in error) console.error('Error hint:', error.hint);
  if ('code' in error) console.error('Error code:', error.code);
};

export const logInfo = (message: string, data?: unknown) => {
  console.log(`[INFO] ${message}`, data ? data : '');
};

export const verifyConnection = async () => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Connection verification failed:', error);
    return false;
  }
};
