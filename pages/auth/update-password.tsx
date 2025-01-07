import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logger } from '@/lib/debug';
import { AUTH_ROUTES } from '@/constants/auth';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  // Check auth state on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        logger.debug('Session check on update password page', {
          hasSession: !!session,
          sessionError: sessionError?.message,
          searchParams: router.asPath,
        });

        if (!session && !router.query.error) {
          logger.warn('No session found on update password page', {
            path: router.asPath,
            query: router.query
          });
          router.push(`${AUTH_ROUTES.login}?error=access_denied&error_description=No+valid+session+found`);
        }
      } catch (err) {
        logger.error('Error checking session:', err);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    logger.debug('Password update attempt initiated', {
      timestamp: new Date().toISOString()
    });

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      logger.warn('Password update failed: passwords do not match');
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      logger.debug('Session state during password update', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id
      });

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        logger.error('Password update failed', {
          error: error.message,
          code: error.status
        });
        throw error;
      }

      logger.info('Password updated successfully', {
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      // Redirect to login page after successful password update
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      logger.error('Unexpected error during password update:', {
        error: err,
        path: router.asPath,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
          <div className="space-y-1 p-6">
            <h1 className="text-3xl font-bold text-center text-foreground">
              Update Password
            </h1>
            <p className="text-center text-foreground/60">
              Enter your new password below
            </p>
          </div>
          <form onSubmit={handleUpdatePassword}>
            <div className="space-y-4 px-6 pt-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background border-input"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background border-input"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="p-6">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
} 