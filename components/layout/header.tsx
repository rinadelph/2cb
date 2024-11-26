import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { authLogger } from "@/lib/auth/auth-logger";
import { usePathname } from 'next/navigation';

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  authLogger.debug('Header rendering:', {
    isAuthenticated: !!user,
    userEmail: user?.email,
    pathname,
    isHomePage
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-8 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">2C</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                2Click Broker
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/listings" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Listings
                </Link>
                <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Analytics
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} />
            ) : isHomePage ? (
              <Button asChild variant="secondary">
                <Link href="/login">Sign In</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
} 