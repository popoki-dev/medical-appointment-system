import { NavLink } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { NavSection } from '@/types'

interface SidebarNavProps {
  sections: NavSection[]
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ sections, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-6">
      {sections.map((section, index) => (
        <div key={section.label ?? index} className="space-y-1">
          {section.label &&
            (collapsed ? (
              <div className="mx-3 mb-2 h-px bg-sidebar-border" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {section.label}
              </p>
            ))}
          {section.items.map((item) => {
            const link = (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-muted hover:bg-muted hover:text-sidebar-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : 'text-sidebar-muted group-hover:text-sidebar-foreground')} />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            )
            return collapsed ? (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )
          })}
        </div>
      ))}
    </nav>
  )
}
