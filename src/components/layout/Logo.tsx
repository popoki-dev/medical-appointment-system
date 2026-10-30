import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { APP_CONFIG } from '@/config/app'
import { cn } from '@/lib/utils'

interface LogoProps {
  to?: string
  collapsed?: boolean
  className?: string
}

export function Logo({ to = '/', collapsed, className }: LogoProps) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5 font-semibold text-foreground', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
        <Plus className="h-5 w-5" strokeWidth={3} />
      </span>
      {!collapsed && <span className="text-lg tracking-tight">{APP_CONFIG.name}</span>}
    </Link>
  )
}
