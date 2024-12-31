import type { Session, User } from '@supabase/supabase-js'

export type { Session, User }

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshSession: () => Promise<any>;
  deleteAccount: () => Promise<void>;
  verifyEmail: (oobCode: string) => Promise<void>;
  getActiveSessions: () => Promise<SessionActivity[]>;
  revokeSession: (sessionId: string) => Promise<void>;
}

export interface SessionInfo {
  id: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
  };
  lastActive: string;
  location?: {
    city?: string;
    country?: string;
    ip?: string;
  };
  current: boolean;
}

export type SessionActivity = {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  browser?: string;
  os?: string;
  status: 'active' | 'expired' | 'revoked';
  lastActive: string;
}

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  metadata: {
    lastSignInTime?: string;
    creationTime: string;
  };
}

export type AuthError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
}
