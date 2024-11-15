export const SESSION_DURATIONS = {
  DEFAULT: 24 * 60 * 60, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days
  MINIMUM: 1 * 60 * 60, // 1 hour
  MAXIMUM: 365 * 24 * 60 * 60, // 1 year
} as const;

export const SESSION_CONFIG = {
  COOKIE_NAME: 'sb-session',
  REMEMBER_ME_KEY: 'remember-me',
  REFRESH_THRESHOLD: 5 * 60, // 5 minutes before expiry
  MAX_INACTIVE_TIME: 30 * 60, // 30 minutes
} as const;

export function getSessionDuration(rememberMe: boolean): number {
  return rememberMe ? SESSION_DURATIONS.REMEMBER_ME : SESSION_DURATIONS.DEFAULT;
}

export function shouldRefreshSession(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now <= SESSION_CONFIG.REFRESH_THRESHOLD;
}

export function isSessionExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
} 