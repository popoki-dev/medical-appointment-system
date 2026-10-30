import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectableCardProps {
  selected: boolean
  disabled?: boolean
  onSelect: () => void
  children: ReactNode
  className?: string
}

/** A card that behaves as one option of a radio group. */
export function SelectableCard({ selected, disabled, onSelect, children, className }: SelectableCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'relative flex w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40 hover:shadow-card',
        disabled && 'cursor-not-allowed opacity-60 hover:border-border hover:shadow-sm',
        className,
      )}
    >
      {children}
      {selected && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary" aria-hidden />}
    </button>
  )
}
