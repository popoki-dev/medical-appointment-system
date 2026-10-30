import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABEL, ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'
import { getInitials } from '@/lib/utils'

interface UserMenuProps {
  profileHref?: string
  settingsHref?: string
}

export function UserMenu({ profileHref, settingsHref }: UserMenuProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out', 'See you next time.')
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left md:block">
          <span className="block text-sm font-medium leading-tight">{user.name}</span>
          <span className="block text-xs leading-tight text-muted-foreground">{ROLE_LABEL[user.role]}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {profileHref && (
            <DropdownMenuItem onSelect={() => navigate(profileHref)}>
              <UserCircle />
              My profile
            </DropdownMenuItem>
          )}
          {settingsHref && (
            <DropdownMenuItem onSelect={() => navigate(settingsHref)}>
              <Settings />
              Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {(profileHref || settingsHref) && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-red-50 focus:text-destructive [&_svg]:text-destructive">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
