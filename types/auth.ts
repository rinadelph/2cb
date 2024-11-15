import { Session, User } from '@supabase/supabase-js'

export interface User {
  id: string;
  name: string;
  email: string;
  // ... other user properties
}

export interface SessionInfo extends Omit<Session, 'user'> {
  user: User;
  id: string;
  lastActive: string;
  deviceInfo: {
    browser: string;
    os: string;
    ip: string;
    location?: string;
  };
}

export interface AuthConfig {
  rememberMe?: boolean;
  sessionDuration?: number;
}

export interface SessionActivity {
  id: string;
  userId: string;
  action: 'created' | 'refreshed' | 'expired' | 'revoked';
  timestamp: string;
  deviceInfo: {
    browser: string;
    os: string;
    ip: string;
  };
}
