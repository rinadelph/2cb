import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function MainNav() {
  const { user } = useAuth();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">2C</span>
        </div>
        <span className="hidden md:inline-block font-bold">2Click Broker</span>
      </Link>
      {user && (
        <nav className="hidden md:flex gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/listings"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Listings
          </Link>
          <Link
            href="/analytics"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Analytics
          </Link>
        </nav>
      )}
    </div>
  );
} 