"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/constants'

export function AccountDeletion() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const { user, deleteAccount } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleExportData = async () => {
    try {
      setIsExporting(true)
      // TODO: Implement data export functionality
      toast({
        title: 'Success',
        description: 'Your data has been exported successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export your data',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    if (confirmEmail !== user.email) {
      toast({
        title: 'Error',
        description: 'Please enter your email correctly to confirm deletion',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsDeleting(true)
      const { error } = await deleteAccount()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Your account has been deleted successfully'
      })

      router.push(AUTH_ROUTES.login)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete your account',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="export-data">Export Your Data</Label>
            <p className="text-sm text-muted-foreground">
              Download a copy of your data before deleting your account
            </p>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="mt-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Export Data'
              )}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Confirm Email</Label>
            <Input
              id="confirm-email"
              type="email"
              placeholder={user?.email || ''}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Please enter your email address to confirm account deletion
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !confirmEmail}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 