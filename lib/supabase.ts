import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zstezgvyrjgkmkdnvcok.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
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

export const logError = (message: string, error: any) => {
  console.error(`[ERROR] ${message}:`, error);
  if (error.message) console.error('Error message:', error.message);
  if (error.details) console.error('Error details:', error.details);
  if (error.hint) console.error('Error hint:', error.hint);
  if (error.code) console.error('Error code:', error.code);
};

export const logInfo = (message: string, data?: any) => {
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
