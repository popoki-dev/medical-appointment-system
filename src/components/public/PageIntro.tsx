import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageIntroProps {
  eyebrow: string
  title: string
  description: ReactNode
  children?: ReactNode
  className?: string
}

/** The tinted title band at the top of each inner public page. */
export function PageIntro({ eyebrow, title, description, children, className }: PageIntroProps) {
  return (
    <section className={cn('border-b bg-gradient-to-b from-accent/70 to-background', className)}>
      <div className="container py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  )
}
