import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

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
