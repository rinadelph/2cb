import { createClient } from '@supabase/supabase-js';

interface ErrorWithDetails {
  message?: string;
  details?: unknown;
  hint?: string;
  code?: string | number;
}

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
