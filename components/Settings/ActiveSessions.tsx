"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface SessionInfo {
  id: string;
  created_at: string;
  last_active: string;
  user_agent?: string;
  ip_address?: string;
  current: boolean;
}

export function ActiveSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const { toast } = useToast()

  const loadSessions = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setSessions([])
        return
      }

      setSessions([{
        id: session.access_token,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        user_agent: window.navigator.userAgent,
        current: true
      }])
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load active sessions',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleRevoke = async (sessionId: string) => {
    try {
      setIsRevoking(sessionId)
      await supabase.auth.signOut()
      
      toast({
        title: 'Success',
        description: 'Session revoked successfully'
      })
      
      loadSessions()
    } catch (error) {
      console.error('Error revoking session:', error)
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      })
    } finally {
      setIsRevoking(null)
    }
  }

  useEffect(() => {
    if (user) {
      loadSessions()
    }
  }, [user, loadSessions])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions across devices</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage your active sessions across devices</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions found</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {session.current ? 'Current Session' : 'Other Session'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.user_agent || 'Unknown Device'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {new Date(session.last_active).toLocaleString()}
                  </p>
                </div>
                {session.current && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(session.id)}
                    disabled={isRevoking === session.id}
                  >
                    {isRevoking === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Sign Out'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 