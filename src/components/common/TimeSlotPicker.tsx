import { Clock, Moon, Sun, Sunrise } from 'lucide-react'
import type { TimeSlot } from '@/types'
import { formatTime, getDayPeriod } from '@/lib/date'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'

const PERIODS = [
  { key: 'morning', label: 'Morning', icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon', icon: Sun },
  { key: 'evening', label: 'Evening', icon: Moon },
] as const

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  value?: string
  onChange: (time: string) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

/** Grid of selectable time slots grouped into morning / afternoon / evening. */
export function TimeSlotPicker({
  slots,
  value,
  onChange,
  loading,
  emptyMessage = 'No slots available on this day. Please choose another date.',
  className,
}: TimeSlotPickerProps) {
  if (loading) return <LoadingState label="Checking availability…" className="py-8" />
  if (!slots.length) return <EmptyState icon={Clock} title="No availability" description={emptyMessage} className="py-8" />

  return (
    <div className={cn('space-y-5', className)} role="radiogroup" aria-label="Available time slots">
      {PERIODS.map(({ key, label, icon: Icon }) => {
        const group = slots.filter((s) => getDayPeriod(s.startTime) === key)
        if (!group.length) return null
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className="font-normal normal-case">
                · {group.filter((s) => s.available).length} available
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {group.map((slot) => {
                const selected = slot.startTime === value
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!slot.available}
                    onClick={() => onChange(slot.startTime)}
                    className={cn(
                      'h-10 rounded-lg border text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-card hover:border-primary/50 hover:bg-accent hover:text-accent-foreground',
                      !slot.available && 'cursor-not-allowed border-dashed bg-muted/50 text-muted-foreground/60 line-through hover:border-input hover:bg-muted/50 hover:text-muted-foreground/60',
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
