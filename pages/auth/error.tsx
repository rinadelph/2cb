import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthError() {
  const router = useRouter();
  const { error, error_description } = router.query;

  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'The link you used is invalid or has expired';
      case 'invalid_request':
        return 'Invalid request. Please try again';
      default:
        return error_description as string || 'An error occurred';
    }
  };

  const getErrorTitle = () => {
    switch (error) {
      case 'access_denied':
        return 'Access Denied';
      case 'invalid_request':
        return 'Invalid Request';
      default:
        return 'Error';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <Card className="border-none shadow-lg bg-background">
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {getErrorTitle()}
            </h1>
            <p className="text-foreground/60">
              {getErrorMessage()}
            </p>
            <div className="pt-4 space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push('/auth/login')}
                size="lg"
              >
                Return to Login
              </Button>
              {error === 'access_denied' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/reset-password')}
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Request New Reset Link
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 