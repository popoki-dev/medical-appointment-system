import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOOKING_STEPS, type BookingStep } from './bookingSteps'

interface BookingStepperProps {
  current: BookingStep
  /** The furthest step the patient may jump to; completed steps stay clickable. */
  reachable: BookingStep
  onSelect: (step: BookingStep) => void
}

/** Numbered progress bar for the booking wizard. */
export function BookingStepper({ current, reachable, onSelect }: BookingStepperProps) {
  return (
    <nav aria-label="Booking progress">
      <p className="mb-3 text-sm text-muted-foreground sm:hidden">
        Step {current + 1} of {BOOKING_STEPS.length}: <span className="font-medium text-foreground">{BOOKING_STEPS[current].title}</span>
      </p>
      <ol className="flex items-center gap-1 sm:gap-2">
        {BOOKING_STEPS.map((step, index) => {
          const done = index < current
          const active = index === current
          const clickable = index <= reachable && !active
          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect(index as BookingStep)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title}${done ? ' (completed)' : ''}`}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  clickable && 'hover:text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    active && 'border-primary bg-primary text-primary-foreground',
                    done && 'border-primary bg-primary/10 text-primary',
                    !active && !done && 'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-sm font-medium lg:inline',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < BOOKING_STEPS.length - 1 && (
                <span className={cn('h-0.5 min-w-2 flex-1 rounded-full', done ? 'bg-primary' : 'bg-border')} aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
