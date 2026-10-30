import { cn } from '@/lib/utils'
import { APPOINTMENT_STATUS_META } from '@/config/status'
import type { AppointmentStatus, StatusTone } from '@/types'

const TONE_CLASSES: Record<StatusTone, { badge: string; dot: string }> = {
  default: { badge: 'bg-primary/10 text-primary ring-primary/20', dot: 'bg-primary' },
  info: { badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  success: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  warning: { badge: 'bg-amber-50 text-amber-800 ring-amber-600/25', dot: 'bg-amber-500' },
  danger: { badge: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
  neutral: { badge: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' },
  teal: { badge: 'bg-teal-50 text-teal-700 ring-teal-600/20', dot: 'bg-teal-500' },
}

type StatusBadgeProps =
  | { status: AppointmentStatus; label?: string; tone?: never; className?: string }
  | { status?: never; label: string; tone: StatusTone; className?: string }

/**
 * Pill-shaped status indicator. Pass an appointment `status` to use the
 * built-in mapping, or an explicit `label` + `tone` for anything else.
 */
export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  const meta = status ? APPOINTMENT_STATUS_META[status] : { label: label!, tone: tone! }
  const classes = TONE_CLASSES[meta.tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        classes.badge,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', classes.dot)} aria-hidden />
      {label ?? meta.label}
    </span>
  )
}
