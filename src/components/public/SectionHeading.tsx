import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: ReactNode
  align?: 'center' | 'left'
  action?: ReactNode
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'center', action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{eyebrow}</p>}
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
