import { Layout } from "@/components/layout/layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { authLogger } from "@/lib/auth/auth-logger";

export default function HomePage() {
  const { user } = useAuth();

  authLogger.debug('HomePage rendering:', {
    isAuthenticated: !!user,
    userEmail: user?.email
  });

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Welcome to 2Click Broker
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Your all-in-one platform for property management and brokerage.
          </p>
        </div>
        <div className="flex gap-4">
          {!user ? (
            <>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
