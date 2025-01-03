import { createClient } from '@supabase/supabase-js'
import { authLogger } from './auth/auth-logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: (...args) => {
          authLogger.debug('Supabase API Request:', { url: args[0] });
          return fetch(...args);
        },
      },
    })
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  authLogger.info('Supabase auth state changed:', {
    event,
    user: session?.user?.email,
    timestamp: new Date().toISOString(),
  })
}) 