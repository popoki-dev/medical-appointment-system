import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'
import type { NavSection } from '@/types'
import { AppBreadcrumbs } from './AppBreadcrumbs'
import { Logo } from './Logo'
import { NotificationMenu } from './NotificationMenu'
import { SidebarNav } from './SidebarNav'
import { UserMenu } from './UserMenu'

export interface DashboardShellProps {
  navigation: NavSection[]
  homeHref: string
  /** Short label shown under the logo, e.g. "Doctor portal". */
  portalLabel: string
  profileHref?: string
  settingsHref?: string
}

/**
 * Shared chrome for every authenticated area: collapsible desktop sidebar,
 * slide-over mobile navigation, top bar with breadcrumbs, notifications and
 * the user menu. Role layouts configure it with their own navigation.
 */
export function DashboardShell({ navigation, homeHref, portalLabel, profileHref, settingsHref }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex',
            collapsed ? 'w-[72px]' : 'w-64',
          )}
        >
          <div className={cn('flex h-16 items-center border-b border-sidebar-border', collapsed ? 'justify-center px-2' : 'px-5')}>
            <Logo to={homeHref} collapsed={collapsed} />
          </div>
          {!collapsed && (
            <p className="px-5 pt-4 text-xs font-medium text-sidebar-muted">{portalLabel}</p>
          )}
          <div className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-3' : 'px-3')}>
            <SidebarNav sections={navigation} collapsed={collapsed} />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
              className={cn('w-full text-muted-foreground', collapsed ? 'justify-center px-0' : 'justify-start')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              {!collapsed && 'Collapse'}
            </Button>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="flex w-72 flex-col p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">{portalLabel} navigation</SheetDescription>
            <div className="flex h-16 items-center border-b px-5">
              <Logo to={homeHref} />
            </div>
            <p className="px-5 pt-4 text-xs font-medium text-sidebar-muted">{portalLabel}</p>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNav sections={navigation} onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-64')}>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:px-6">
            <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="!h-5 !w-5" />
            </Button>
            <AppBreadcrumbs className="hidden min-w-0 flex-1 sm:block" />
            <div className="flex-1 sm:hidden">
              <Logo to={homeHref} />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationMenu />
              <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
              <UserMenu profileHref={profileHref} settingsHref={settingsHref} />
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <AppBreadcrumbs className="mb-4 sm:hidden" />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
