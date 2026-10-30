import { addDays } from 'date-fns'
import { CalendarClock } from 'lucide-react'
import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { DoctorAvailability } from '@/services'

export function describeNextSlot(next: DoctorAvailability['next']) {
  if (!next) return null
  const today = toDateKey(new Date())
  const tomorrow = toDateKey(addDays(new Date(), 1))
  const day = next.date === today ? 'Today' : next.date === tomorrow ? 'Tomorrow' : formatDate(next.date, 'EEE, MMM d')
  return `${day}, ${formatTime(next.startTime)}`
}

/** "Next available: Today, 2:30 PM", or a fully-booked notice. */
export function NextAvailable({ availability, className }: { availability?: DoctorAvailability; className?: string }) {
  if (!availability) return <span className={cn('h-4 w-40 animate-pulse rounded bg-muted', className)} aria-hidden />
  const label = describeNextSlot(availability.next)
  return (
    <span className={cn('flex items-start gap-1.5 text-xs', label ? 'text-secondary' : 'text-muted-foreground', className)}>
      <CalendarClock className="mt-px h-3.5 w-3.5 shrink-0" />
      {label ? (
        <span>
          <span className="text-muted-foreground">Next available: </span>
          <span className="whitespace-nowrap font-medium">{label}</span>
        </span>
      ) : (
        'No openings in the next two weeks'
      )}
    </span>
  )
}
