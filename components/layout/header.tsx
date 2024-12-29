import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { MainNav } from "./main-nav";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { authLogger } from "@/lib/auth/auth-logger";
import { useRouter } from 'next/router';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = router.pathname || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {user ? (
              <UserMenu user={user} />
            ) : pathname && !pathname.startsWith('/auth/') && (
              <Button asChild variant="secondary">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 