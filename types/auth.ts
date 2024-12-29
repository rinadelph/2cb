import type { Session, User } from '@supabase/supabase-js'

export type { Session, User }

export interface AuthContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
}
