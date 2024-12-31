import { logger } from '@/lib/debug'
import { SessionActivity } from '@/types/auth'

export type SecurityAlert = {
  id: string
  type: 'suspicious_activity' | 'multiple_failures' | 'new_device' | 'new_location'
  severity: 'low' | 'medium' | 'high'
  message: string
  timestamp: string
  metadata: Record<string, any>
}

export class SecurityMonitor {
  private alerts: SecurityAlert[] = []
  private readonly maxFailedAttempts = 3
  private readonly failureWindow = 15 * 60 * 1000 // 15 minutes in milliseconds
  private failedAttempts: { [key: string]: { count: number; lastAttempt: number }[] } = {}

  constructor() {
    this.alerts = []
  }

  public addActivity(activity: SessionActivity) {
    const alert = this.detectSuspiciousActivity(activity)
    if (alert) {
      this.alerts.push(alert)
      logger.warn('Security alert detected', { alert })
    }
  }

  private detectSuspiciousActivity(activity: SessionActivity): SecurityAlert | null {
    const { status, device, timestamp, ipAddress } = activity

    // Check for multiple failed attempts
    if (status === 'expired') {
      const userFailures = this.failedAttempts[ipAddress] || []
      const recentFailures = userFailures.filter(
        f => Date.now() - f.lastAttempt < this.failureWindow
      )

      if (recentFailures.length >= this.maxFailedAttempts) {
        return {
          id: crypto.randomUUID(),
          type: 'multiple_failures',
          severity: 'high',
          message: `Multiple failed login attempts detected from IP ${ipAddress}`,
          timestamp: new Date().toISOString(),
          metadata: {
            ipAddress,
            failureCount: recentFailures.length,
            device
          }
        }
      }

      this.failedAttempts[ipAddress] = [
        ...recentFailures,
        { count: recentFailures.length + 1, lastAttempt: Date.now() }
      ]
    }

    // Check for new device or location
    const ip = activity.ipAddress
    if (status === 'active' && device) {
      return {
        id: crypto.randomUUID(),
        type: 'new_device',
        severity: 'medium',
        message: `New device detected: ${device}`,
        timestamp: new Date().toISOString(),
        metadata: {
          device,
          ipAddress
        }
      }
    }

    return null
  }

  public getAlerts(): SecurityAlert[] {
    return this.alerts
  }

  public clearAlerts() {
    this.alerts = []
  }
} 