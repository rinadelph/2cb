import { createClient } from '@supabase/supabase-js';
import { createSupabaseLogger } from '../logging/supabase-logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  createSupabaseLogger(supabase);
} 