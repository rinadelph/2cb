"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Layout } from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/auth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(AUTH_ROUTES.login);
    } else if (!isLoading && user) {
      router.push(AUTH_ROUTES.dashboard);
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </Layout>
  );
}
