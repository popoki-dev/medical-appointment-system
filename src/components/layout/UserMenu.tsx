import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, DatabaseBackup, LogOut, Settings, UserCircle } from 'lucide-react'
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
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
import { storageService } from '@/services'

interface UserMenuProps {
  profileHref?: string
  settingsHref?: string
}

export function UserMenu({ profileHref, settingsHref }: UserMenuProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)
  if (!user) return null

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out', 'See you next time.')
    navigate(ROUTES.login, { replace: true })
  }

  const handleReset = async () => {
    await new Promise((r) => setTimeout(r, 300))
    storageService.reset()
    toast.success('Demo data reset', 'All records were restored to the original mock dataset.')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            {user.profileImage && <AvatarImage src={user.profileImage} alt={user.fullName} />}
            <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left md:block">
            <span className="block text-sm font-medium leading-tight">{user.fullName}</span>
            <span className="block text-xs leading-tight text-muted-foreground">{ROLE_LABEL[user.role]}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">{user.fullName}</p>
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
            <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
              <DatabaseBackup />
              Reset demo data
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-red-50 focus:text-destructive [&_svg]:text-destructive">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        variant="destructive"
        title="Reset all demo data?"
        description="Every appointment, profile and notification change made in this browser will be discarded and the original mock dataset restored. You'll stay signed in."
        confirmLabel="Reset data"
        onConfirm={handleReset}
      />
    </>
  )
}
