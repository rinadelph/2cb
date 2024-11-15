"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SessionInfo } from '@/types/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Monitor, Smartphone, Laptop, LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function ActiveSessions() {
  const { getActiveSessions, revokeSession } = useAuth()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    const { data, error } = await getActiveSessions()
    if (data && !error) {
      setSessions(data.sessions)
    }
    setIsLoading(false)
  }

  const handleRevoke = async (sessionId: string) => {
    setIsRevoking(sessionId)
    await revokeSession(sessionId)
    await loadSessions()
    setIsRevoking(null)
  }

  const getDeviceIcon = (deviceInfo: SessionInfo['deviceInfo']) => {
    const os = deviceInfo.os.toLowerCase()
    if (os.includes('android') || os.includes('ios')) {
      return <Smartphone className="h-4 w-4" />
    }
    if (os.includes('windows') || os.includes('mac') || os.includes('linux')) {
      return <Laptop className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across different devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                {getDeviceIcon(session.deviceInfo)}
              </div>
              <div>
                <p className="font-medium">{session.deviceInfo.browser}</p>
                <p className="text-sm text-muted-foreground">
                  {session.deviceInfo.os} • {session.deviceInfo.ip}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active {formatDistanceToNow(new Date(session.lastActive))} ago
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRevoke(session.id)}
              disabled={isRevoking === session.id}
            >
              {isRevoking === session.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 