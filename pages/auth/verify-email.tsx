import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'

export default function VerifyEmail() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <Card className="border-none shadow-lg bg-background">
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Check your email
              </h1>
              <p className="text-base text-foreground/60">
                We've sent you a verification link to your email address.
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/login')}
                size="lg"
              >
                Back to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => router.reload()}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}