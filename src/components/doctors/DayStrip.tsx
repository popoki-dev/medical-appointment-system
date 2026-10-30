import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'

interface DayStripProps {
  /** Dates to offer, as "yyyy-MM-dd". */
  dates: string[]
  value?: string
  onChange: (date: string) => void
  /** Free slots per date; omit while loading. */
  freeByDate?: Record<string, number>
  className?: string
}

/** A scrollable row of day buttons, each showing how many slots are free. */
export function DayStrip({ dates, value, onChange, freeByDate, className }: DayStripProps) {
  return (
    <div className={cn('-mx-1 flex gap-2 overflow-x-auto px-1 pb-2', className)} role="radiogroup" aria-label="Choose a day">
      {dates.map((date) => {
        const free = freeByDate?.[date]
        const selected = date === value
        return (
          <button
            key={date}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${formatDate(date, 'EEEE, MMMM d')}, ${free === undefined ? 'checking availability' : free === 0 ? 'fully booked' : `${free} slots free`}`}
            onClick={() => onChange(date)}
            className={cn(
              'flex w-16 shrink-0 flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/50 hover:bg-accent',
              !selected && free === 0 && 'text-muted-foreground',
            )}
          >
            <span className="text-[11px] font-medium uppercase">{formatDate(date, 'EEE')}</span>
            <span className="text-lg font-semibold leading-tight">{formatDate(date, 'd')}</span>
            <span className={cn('text-[10px]', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
              {free === undefined ? '…' : free === 0 ? 'Full' : `${free} free`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
