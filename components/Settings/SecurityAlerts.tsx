import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SecurityAlert, SecurityMonitor } from '@/lib/security/alerts'
import { AlertTriangle, Shield, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

const securityMonitor = new SecurityMonitor()

export function SecurityAlerts() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])

  useEffect(() => {
    setAlerts(securityMonitor.getAlerts())
  }, [])

  const handleClearAlerts = () => {
    securityMonitor.clearAlerts()
    setAlerts([])
  }

  const getSeverityIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'medium':
        return <Shield className="h-5 w-5 text-warning" />
      case 'low':
        return <Info className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          View and manage security alerts for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground">No security alerts</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            <Button onClick={handleClearAlerts} variant="outline" className="w-full">
              Clear All Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 