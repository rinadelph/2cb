"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { AlertTriangle, Download, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/debug'

export function AccountDeletion() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const { deleteAccount } = useAuth()
  const { toast } = useToast()

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Implement data export logic here
      logger.info('Data export initiated')
      toast({
        title: "Data export started",
        description: "Your data will be downloaded shortly.",
      })
    } catch (err) {
      logger.error('Data export failed:', err)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const { error } = await deleteAccount(feedback)
      
      if (error) throw error

      toast({
        title: "Account scheduled for deletion",
        description: "Your account will be deleted after the recovery period.",
      })
      
      // Redirect to home page
      window.location.href = "/"
    } catch (err) {
      logger.error('Account deletion failed:', err)
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "Failed to delete your account. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p>Warning: This action cannot be undone. All your data will be permanently deleted.</p>
          <p className="mt-2">There will be a 30-day recovery period during which you can restore your account.</p>
        </div>

        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export My Data
          </Button>
        </div>

        {!showConfirmation ? (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowConfirmation(true)}
          >
            I want to delete my account
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Why are you leaving? (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Help us improve our service..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-email">
                Type your email to confirm deletion
              </Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>
        )}
      </CardContent>
      {showConfirmation && (
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="destructive"
            className="w-full"
            disabled={isDeleting || !confirmEmail}
            onClick={handleDeleteAccount}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Account
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 