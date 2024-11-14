"use client"

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/debug'
import { useToast } from '@/components/ui/use-toast'

export function LoginForm() {
  const router = useRouter()
  const { signIn, signInWithEmail } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmail(email, password)
      logger.success('Email login successful')
      router.push('/dashboard')
    } catch (error) {
      logger.error('Login error:', error)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      logger.info('Starting Google login');
      await signIn('google');
    } catch (error: any) {
      logger.error('Google login failed', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message === "Unsupported provider" 
          ? "Google login is not configured. Please try email login or contact support."
          : "Failed to login with Google. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className={cn(
          "w-full",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  )
}
