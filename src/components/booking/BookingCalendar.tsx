import { useMemo, type ReactNode } from 'react'
import { getDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { BOOKING_CONFIG } from '@/config/booking'
import { formatDate, fromDateKey, toDateKey } from '@/lib/date'
import type { DoctorSchedule } from '@/types'

interface BookingCalendarProps {
  value?: string
  onChange: (date: string) => void
  /** Free slots per date across the booking window, from the doctor's availability. */
  freeByDate: Record<string, number>
  schedules: DoctorSchedule[]
  lastDate: string
}

/**
 * Step 3: a month calendar limited to the booking window. Only days with a free slot
 * can be picked; days the doctor works but is full, and days off, are marked differently.
 */
export function BookingCalendar({ value, onChange, freeByDate, schedules, lastDate }: BookingCalendarProps) {
  const today = toDateKey(new Date())
  const workingDays = useMemo(() => new Set(schedules.filter((s) => s.isAvailable).map((s) => s.dayOfWeek as number)), [schedules])
  const isFree = (date: Date) => (freeByDate[toDateKey(date)] ?? 0) > 0
  const isFull = (date: Date) => {
    const key = toDateKey(date)
    return key >= today && key <= lastDate && workingDays.has(getDay(date)) && !isFree(date)
  }
  const firstFree = Object.keys(freeByDate).sort().find((d) => freeByDate[d] > 0)
  const selected = value ? fromDateKey(value) : undefined
  const freeDays = Object.values(freeByDate).filter((n) => n > 0).length

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className="rounded-xl border bg-card p-1 md:shrink-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(toDateKey(date))}
          defaultMonth={selected ?? (firstFree ? fromDateKey(firstFree) : new Date())}
          fromDate={fromDateKey(today)}
          toDate={fromDateKey(lastDate)}
          disabled={(date) => !isFree(date)}
          showOutsideDays={false}
          modifiers={{ available: isFree, full: isFull }}
          modifiersClassNames={{
            available:
              'relative font-semibold text-foreground after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-secondary aria-selected:after:bg-primary-foreground',
            full: 'line-through',
          }}
          classNames={{ day_disabled: 'text-muted-foreground/50 hover:bg-transparent' }}
        />
      </div>
      <div className="space-y-4 text-sm">
        <ul className="space-y-2" aria-label="Calendar legend">
          <Legend swatch={<span className="h-1.5 w-1.5 rounded-full bg-secondary" />} label="Available — has open slots" />
          <Legend swatch={<span className="text-xs text-muted-foreground line-through">15</span>} label="Fully booked" />
          <Legend swatch={<span className="text-xs text-muted-foreground/50">15</span>} label="Not working or outside the booking window" />
        </ul>
        <p className="text-muted-foreground">
          {freeDays
            ? `${freeDays} ${freeDays === 1 ? 'day has' : 'days have'} openings in the next ${BOOKING_CONFIG.horizonDays} days.`
            : `No openings in the next ${BOOKING_CONFIG.horizonDays} days.`}
        </p>
        {value && (
          <p className="rounded-lg bg-accent px-3 py-2 text-accent-foreground">
            <span className="font-semibold">{formatDate(value, 'EEEE, MMMM d')}</span> · {freeByDate[value] ?? 0} open{' '}
            {(freeByDate[value] ?? 0) === 1 ? 'slot' : 'slots'}
          </p>
        )}
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-card">{swatch}</span>
      <span className="text-muted-foreground">{label}</span>
    </li>
  )
}
