import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  User, Bell, Shield, CreditCard, Building2, 
  Settings as SettingsIcon 
} from "lucide-react";
import { AUTH_ROUTES } from "@/lib/auth";

const settingsNavItems = [
  {
    title: "Profile",
    href: `${AUTH_ROUTES.settings}/profile`,
    icon: User,
  },
  {
    title: "Notifications",
    href: `${AUTH_ROUTES.settings}/notifications`,
    icon: Bell,
  },
  {
    title: "Security",
    href: `${AUTH_ROUTES.settings}/security`,
    icon: Shield,
  },
  {
    title: "Billing",
    href: `${AUTH_ROUTES.settings}/billing`,
    icon: CreditCard,
  },
  {
    title: "Broker Info",
    href: `${AUTH_ROUTES.settings}/broker`,
    icon: Building2,
  },
  {
    title: "Advanced",
    href: `${AUTH_ROUTES.settings}/advanced`,
    icon: SettingsIcon,
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-start rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  router.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  );
}