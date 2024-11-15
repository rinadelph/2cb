import { Layout } from '@/components/Layout'
import { ActiveSessions } from '@/components/Settings/ActiveSessions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SessionsPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <p className="text-muted-foreground">
              Manage your active sessions and security settings
            </p>
          </div>
          
          <ActiveSessions />

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure your session security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add security settings here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
} 