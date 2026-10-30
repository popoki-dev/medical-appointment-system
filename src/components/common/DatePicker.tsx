import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  /** Days that cannot be selected, e.g. `[{ before: new Date() }, { dayOfWeek: [0, 6] }]`. */
  disabled?: Matcher | Matcher[]
  fromDate?: Date
  toDate?: Date
  id?: string
  invalid?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  fromDate,
  toDate,
  id,
  invalid,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          aria-invalid={invalid || undefined}
          className={cn(
            'w-full justify-start font-normal',
            !value && 'text-muted-foreground',
            invalid && 'border-destructive',
            className,
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {value ? format(value, 'EEE, MMM d, yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
          defaultMonth={value}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
