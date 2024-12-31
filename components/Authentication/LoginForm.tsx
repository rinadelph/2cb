"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { logger } from '@/lib/debug'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { AUTH_ROUTES } from '@/lib/auth'

export function LoginForm() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState<boolean>(false)

  useEffect(() => {
    try {
      const remembered = localStorage.getItem('rememberMe') === 'true'
      logger.info('Loaded remember me preference:', { remembered })
      setRememberMe(remembered)
    } catch (err) {
      logger.error('Failed to load remember me preference:', err)
    }
  }, [])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) {
      logger.info('Submit blocked - already loading')
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      logger.info('Login form submitted', { 
        email,
        rememberMe
      })

      const { error } = await signIn(email, password)

      if (error) {
        logger.error('Login form error:', { 
          error: error.message
        })
        setFormError(error.message)
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid login credentials",
        })
      } else {
        logger.info('Login successful, saving preferences')
        try {
          localStorage.setItem('rememberMe', rememberMe.toString())
        } catch (err) {
          logger.error('Failed to save remember me preference:', err)
        }
        toast({
          title: "Success",
          description: "Successfully signed in",
        })
        router.push('/dashboard')
      }
    } catch (err) {
      logger.error('Unexpected error in login form:', err)
      setFormError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-lg bg-background">
      <CardHeader className="space-y-1">
        <h1 className="text-3xl font-bold text-center text-foreground">
          Log in to your account
        </h1>
        <p className="text-center text-foreground/60">
          Enter your credentials to access your account
        </p>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 pt-4">
          {formError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              className="bg-background border-input"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Link 
                href={AUTH_ROUTES.resetPassword}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
              required
              className="bg-background border-input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label 
              htmlFor="remember" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          <p className="text-center text-sm text-foreground/60">
            Don&apos;t have an account?{' '}
            <Link href={AUTH_ROUTES.register} className="text-primary hover:text-primary/80 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
