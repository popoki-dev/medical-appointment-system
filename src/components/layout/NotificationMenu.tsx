import { Bell, CalendarCheck, CheckCheck, Clock, Info, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { formatRelative } from '@/lib/date'
import { cn } from '@/lib/utils'
import { notificationService } from '@/services'
import type { NotificationType } from '@/types'

const TYPE_ICON: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  appointment: { icon: CalendarCheck, className: 'bg-primary/10 text-primary' },
  reminder: { icon: Clock, className: 'bg-secondary/10 text-secondary' },
  system: { icon: Info, className: 'bg-slate-100 text-slate-600' },
  alert: { icon: TriangleAlert, className: 'bg-amber-100 text-amber-700' },
}

export function NotificationMenu() {
  const { user } = useAuth()
  const { data: notifications = [], isLoading, reload } = useAsync(
    () => (user ? notificationService.listForUser(user.id) : Promise.resolve([])),
    [user?.id],
  )
  const unread = notifications.filter((n) => !n.read).length

  const markAll = async () => {
    if (!user) return
    await notificationService.markAllAsRead(user.id)
    await reload()
  }

  const markOne = async (id: string) => {
    await notificationService.markAsRead(id)
    await reload()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="!h-5 !w-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white ring-2 ring-card">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread ? `${unread} unread` : 'All caught up'}</p>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAll} className="text-primary">
              <CheckCheck />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && !notifications.length ? (
            <LoadingState className="py-8" />
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="We'll let you know when something arrives." className="py-8" />
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const { icon: Icon, className } = TYPE_ICON[n.type]
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.read && markOne(n.id)}
                      className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60', !n.read && 'bg-accent/40')}
                    >
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', className)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{n.title}</span>
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground/80">{formatRelative(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
