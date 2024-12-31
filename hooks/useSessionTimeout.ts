"use client"

import * as React from 'react'
import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './useAuth'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/debug'
import { ToastAction } from '@/components/ui/toast'
import { SESSION_CONFIG } from '@/lib/auth/session-config'

const TIMEOUT_WARNING = SESSION_CONFIG.REFRESH_THRESHOLD * 1000 // Convert to milliseconds
const SESSION_TIMEOUT = SESSION_CONFIG.MAX_INACTIVE_TIME * 1000 // Convert to milliseconds

export function useSessionTimeout() {
  const { signOut, refreshSession } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const timeoutId = useRef<NodeJS.Timeout>()
  const warningId = useRef<NodeJS.Timeout>()

  const resetTimers = useCallback(async () => {
    if (timeoutId.current) clearTimeout(timeoutId.current)
    if (warningId.current) clearTimeout(warningId.current)

    // Set warning timer
    warningId.current = setTimeout(() => {
      showTimeoutWarning()
    }, SESSION_TIMEOUT - TIMEOUT_WARNING)

    // Set timeout timer
    timeoutId.current = setTimeout(async () => {
      logger.info('Session timed out due to inactivity')
      await signOut()
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity.",
        variant: "destructive",
      })
      router.push('/auth/login')
    }, SESSION_TIMEOUT)
  }, [toast, signOut, router, refreshSession])

  useEffect(() => {
    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart']
    
    const handleUserActivity = () => {
      resetTimers()
    }

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity)
    })

    // Initial timer setup
    resetTimers()

    // Cleanup
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
      if (warningId.current) clearTimeout(warningId.current)
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
    }
  }, [resetTimers])

  const showTimeoutWarning = () => {
    const handleSessionExtension = async () => {
      try {
        const session = await refreshSession()
        if (session) {
          toast({
            title: "Session Extended",
            description: "Your session has been extended successfully.",
            variant: "default",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to extend session. Please try logging in again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Failed to refresh session:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    }

    toast({
      title: "Session Timeout Warning",
      description: "Your session will expire in 5 minutes. Would you like to stay signed in?",
      action: React.createElement(ToastAction, {
        altText: "Stay Signed In",
        onClick: handleSessionExtension,
        children: "Stay Signed In"
      }) as React.ReactElement
    })
  }
} 