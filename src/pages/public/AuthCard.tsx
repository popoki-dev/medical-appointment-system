import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md p-6 shadow-elevated sm:p-8">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </Card>
    </div>
  )
}
