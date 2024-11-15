import { logger } from '@/lib/debug'
import { SessionActivity } from '@/types/auth'

export type SecurityAlert = {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

export class SecurityAlertSystem {
  private static instance: SecurityAlertSystem
  private alerts: SecurityAlert[] = []

  private constructor() {}

  static getInstance(): SecurityAlertSystem {
    if (!SecurityAlertSystem.instance) {
      SecurityAlertSystem.instance = new SecurityAlertSystem()
    }
    return SecurityAlertSystem.instance
  }

  analyzeSessionActivity(activity: SessionActivity): SecurityAlert | null {
    // Analyze for suspicious patterns
    const alert = this.detectSuspiciousActivity(activity)
    if (alert) {
      this.alerts.push(alert)
      logger.warn('Security alert generated', { alert })
      return alert
    }
    return null
  }

  private detectSuspiciousActivity(activity: SessionActivity): SecurityAlert | null {
    const { action, deviceInfo, timestamp } = activity

    // Check for multiple failed attempts
    if (action === 'expired') {
      return {
        id: crypto.randomUUID(),
        type: 'warning',
        message: 'Multiple session expiries detected',
        timestamp: new Date().toISOString(),
        metadata: { deviceInfo, timestamp }
      }
    }

    // Check for unusual locations/devices
    if (action === 'created' && this.isUnusualLocation(deviceInfo.ip)) {
      return {
        id: crypto.randomUUID(),
        type: 'critical',
        message: 'Login from unusual location detected',
        timestamp: new Date().toISOString(),
        metadata: { deviceInfo, timestamp }
      }
    }

    return null
  }

  private isUnusualLocation(ip: string): boolean {
    // Implement IP-based location checking
    // This is a placeholder - you'd want to implement proper IP geolocation
    return false
  }

  getRecentAlerts(): SecurityAlert[] {
    return this.alerts.slice(-10) // Get last 10 alerts
  }

  clearAlert(id: string) {
    this.alerts = this.alerts.filter(alert => alert.id !== id)
  }
}

export const securityAlerts = SecurityAlertSystem.getInstance() 