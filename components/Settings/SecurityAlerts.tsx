import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SecurityAlert, securityAlerts } from '@/lib/security/alerts'
import { AlertTriangle, Shield, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SecurityAlerts() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])

  useEffect(() => {
    // Poll for new alerts every minute
    const interval = setInterval(() => {
      setAlerts(securityAlerts.getRecentAlerts())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <Shield className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          Recent security events and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No security alerts
          </p>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getAlertIcon(alert.type)}
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  securityAlerts.clearAlert(alert.id)
                  setAlerts(securityAlerts.getRecentAlerts())
                }}
              >
                Dismiss
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 