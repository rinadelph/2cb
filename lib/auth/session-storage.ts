import { Session } from '@supabase/supabase-js'
import { SESSION_CONFIG } from './session-config'
import { logger } from '@/lib/debug'

export class SessionStorage {
  static getRememberMe(): boolean {
    try {
      return localStorage.getItem(SESSION_CONFIG.REMEMBER_ME_KEY) === 'true'
    } catch (err) {
      logger.error('Error reading remember me preference:', err)
      return false
    }
  }

  static setRememberMe(value: boolean): void {
    try {
      if (value) {
        localStorage.setItem(SESSION_CONFIG.REMEMBER_ME_KEY, 'true')
      } else {
        localStorage.removeItem(SESSION_CONFIG.REMEMBER_ME_KEY)
      }
      logger.info('Remember me preference updated', { value })
    } catch (err) {
      logger.error('Error saving remember me preference:', err)
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_CONFIG.REMEMBER_ME_KEY)
      logger.info('Session storage cleared')
    } catch (err) {
      logger.error('Error clearing session storage:', err)
    }
  }

  static async persistSession(session: Session): Promise<void> {
    try {
      if (this.getRememberMe()) {
        // Store minimal session info
        const sessionInfo = {
          userId: session.user.id,
          expiresAt: session.expires_at,
          lastActive: new Date().toISOString()
        }
        localStorage.setItem('session-info', JSON.stringify(sessionInfo))
        logger.info('Session info persisted', { userId: session.user.id })
      }
    } catch (err) {
      logger.error('Error persisting session:', err)
    }
  }
} 