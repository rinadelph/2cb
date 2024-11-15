import { Layout } from '@/components/Layout'
import { AccountDeletion } from '@/components/Settings/AccountDeletion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/debug'

export default function AccountSettingsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data')
      if (!response.ok) throw new Error('Failed to export data')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      logger.info('Account data exported successfully')
      toast({
        title: "Data exported",
        description: "Your account data has been downloaded successfully.",
      })
    } catch (err) {
      logger.error('Failed to export account data:', err)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export your account data. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and data
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Account Data</CardTitle>
              <CardDescription>
                Download a copy of your account data and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </CardContent>
          </Card>

          <AccountDeletion />
        </div>
      </div>
    </Layout>
  )
} 