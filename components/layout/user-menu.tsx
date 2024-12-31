import { User } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import { AUTH_ROUTES } from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth()
  const initials = user.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={AUTH_ROUTES.dashboard}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={AUTH_ROUTES.settings}>Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => signOut()}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 