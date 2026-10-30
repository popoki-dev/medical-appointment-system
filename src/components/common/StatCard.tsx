import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Tone = 'primary' | 'teal' | 'amber' | 'rose'

const TONES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  teal: 'bg-secondary/10 text-secondary',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-600',
}

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  tone?: Tone
  description?: string
  trend?: { value: number; label?: string }
  loading?: boolean
  className?: string
}

export function StatCard({ title, value, icon: Icon, tone = 'primary', description, trend, loading, className }: StatCardProps) {
  const positive = (trend?.value ?? 0) >= 0
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          )}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium',
                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          <span className="truncate text-muted-foreground">{trend?.label ?? description}</span>
        </div>
      )}
    </Card>
  )
}
