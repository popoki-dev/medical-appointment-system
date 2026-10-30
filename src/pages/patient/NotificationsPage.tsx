import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { NOTIFICATION_TYPE_ICON } from '@/components/layout/NotificationMenu'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDate, formatRelative } from '@/lib/date'
import { cn } from '@/lib/utils'
import { notificationService } from '@/services'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'appointment', label: 'Appointments' },
] as const
type Filter = (typeof FILTERS)[number]['value']

export function NotificationsPage() {
  const { user } = useAuth()
  const { data: notifications = [], isLoading } = useNotifications(user?.id)
  const [filter, setFilter] = useState<Filter>('all')

  const unread = notifications.filter((n) => !n.isRead).length
  const visible = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : filter === 'appointment' ? n.type === 'appointment' || n.type === 'reminder' : true,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : 'You are all caught up.'}
        actions={
          unread > 0 && (
            <Button variant="outline" onClick={() => user && notificationService.markAllAsRead(user.id)}>
              <CheckCheck /> Mark all as read
            </Button>
          )
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter notifications">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'default' : 'outline'}
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <LoadingState className="py-12" />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description="Booking confirmations, changes and reminders will appear here."
            className="py-12"
          />
        ) : (
          <ul className="divide-y">
            {visible.map((n) => {
              const { icon: Icon, className } = NOTIFICATION_TYPE_ICON[n.type]
              return (
                <li key={n.id} className={cn('flex gap-4 px-4 py-4 sm:px-6', !n.isRead && 'bg-accent/40')}>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', className)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80" title={formatDate(n.createdAt, 'MMM d, yyyy · h:mm a')}>
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" className="shrink-0 self-start" onClick={() => notificationService.markAsRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
