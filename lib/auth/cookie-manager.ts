import { SESSION_CONFIG } from './session-config'
import { logger } from '@/lib/debug'
import Cookies from 'js-cookie'

interface CookieOptions {
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  domain?: string
  path?: string
  expires?: number
}

export class CookieManager {
  private static getDefaultOptions(): CookieOptions {
    return {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    }
  }

  static setSessionCookie(value: string, rememberMe: boolean): void {
    try {
      const options: CookieOptions = {
        ...this.getDefaultOptions(),
        expires: rememberMe ? 30 : 1, // 30 days or 1 day
      }

      Cookies.set(SESSION_CONFIG.COOKIE_NAME, value, options)
      logger.info('Session cookie set', { rememberMe })
    } catch (err) {
      logger.error('Error setting session cookie:', err)
    }
  }

  static getSessionCookie(): string | undefined {
    try {
      return Cookies.get(SESSION_CONFIG.COOKIE_NAME)
    } catch (err) {
      logger.error('Error reading session cookie:', err)
      return undefined
    }
  }

  static removeSessionCookie(): void {
    try {
      Cookies.remove(SESSION_CONFIG.COOKIE_NAME, this.getDefaultOptions())
      logger.info('Session cookie removed')
    } catch (err) {
      logger.error('Error removing session cookie:', err)
    }
  }

  static setSecureCookie(name: string, value: string, options?: CookieOptions): void {
    try {
      Cookies.set(name, value, {
        ...this.getDefaultOptions(),
        ...options,
      })
      logger.info('Secure cookie set', { name })
    } catch (err) {
      logger.error('Error setting secure cookie:', err)
    }
  }

  static clearAllAuthCookies(): void {
    try {
      const authCookies = [
        SESSION_CONFIG.COOKIE_NAME,
        'sb-access-token',
        'sb-refresh-token'
      ]

      authCookies.forEach(cookieName => {
        this.removeSessionCookie()
      })

      logger.info('All auth cookies cleared')
    } catch (err) {
      logger.error('Error clearing auth cookies:', err)
    }
  }
} 