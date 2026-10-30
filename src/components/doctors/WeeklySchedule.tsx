import { getDay } from 'date-fns'
import { Coffee } from 'lucide-react'
import { formatTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { DayOfWeek, DoctorSchedule } from '@/types'

const DAYS: { day: DayOfWeek; label: string }[] = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
]

/** Monday-to-Sunday working hours, with breaks and days off. Today is highlighted. */
export function WeeklySchedule({ schedules }: { schedules: DoctorSchedule[] }) {
  const today = getDay(new Date())
  return (
    <ul className="divide-y rounded-lg border">
      {DAYS.map(({ day, label }) => {
        const schedule = schedules.find((s) => s.dayOfWeek === day && s.isAvailable)
        return (
          <li key={day} className={cn('flex items-start justify-between gap-4 px-4 py-2.5 text-sm', day === today && 'bg-accent/60')}>
            <span className="font-medium">
              {label}
              {day === today && <span className="ml-2 text-xs font-normal text-primary">Today</span>}
            </span>
            {schedule ? (
              <span className="flex flex-col items-end text-right tabular-nums">
                <span>
                  {formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}
                </span>
                {schedule.breakStart && schedule.breakEnd && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Coffee className="h-3 w-3" /> Break {formatTime(schedule.breakStart)}–{formatTime(schedule.breakEnd)}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
