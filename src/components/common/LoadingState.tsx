import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  variant?: 'spinner' | 'table' | 'cards' | 'page'
  label?: string
  rows?: number
  className?: string
}

export function LoadingState({ variant = 'spinner', label = 'Loading…', rows = 5, className }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className={cn('space-y-3 p-4', className)} aria-busy="true" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)} aria-busy="true" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground',
        variant === 'page' ? 'min-h-[60vh]' : 'py-12',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  )
}
