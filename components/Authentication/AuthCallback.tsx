"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { AUTH_ROUTES } from "@/lib/auth";

export function AuthCallback() {
  const router = useRouter()
  const { session } = useAuth()

  useEffect(() => {
    if (session) {
      router.push(AUTH_ROUTES.dashboard)
    }
  }, [session, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Verifying...</h2>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  )
} 