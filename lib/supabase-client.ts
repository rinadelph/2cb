import { createClient } from '@supabase/supabase-js'
import { authLogger } from './auth/auth-logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      authLogger.debug('Supabase API Request:', { url: args[0] })
      return fetch(...args)
    },
  },
})

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  authLogger.info('Supabase auth state changed:', {
    event,
    user: session?.user?.email,
    timestamp: new Date().toISOString(),
  })
}) 