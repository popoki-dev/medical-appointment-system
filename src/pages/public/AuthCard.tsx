import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/Logo'
import { Card } from '@/components/ui/card'
import { APP_CONFIG } from '@/config/app'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  description: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10 sm:py-12">
      <Card className={cn('w-full max-w-md p-6 shadow-elevated sm:p-8', className)}>
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="flex-col gap-2 [&>span:first-child]:h-12 [&>span:first-child]:w-12" />
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{APP_CONFIG.hospitalName}</p>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </Card>
    </div>
  )
}
