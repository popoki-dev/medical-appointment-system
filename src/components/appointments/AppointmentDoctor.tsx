import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'
import type { AppointmentDetails } from '@/types'

const initialsOf = (name: string) => getInitials(name.replace(/^Dr\.?\s*/, ''))

/** The doctor's photo (or initials), name and specialization for an appointment. */
export function AppointmentDoctor({
  appointment,
  size = 'md',
  subtitle,
  className,
}: {
  appointment: Pick<AppointmentDetails, 'doctor' | 'doctorName'>
  size?: 'sm' | 'md' | 'lg'
  /** Replaces the specialization line. */
  subtitle?: string
  className?: string
}) {
  const { doctor, doctorName } = appointment
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar className={cn('shrink-0', size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-14 w-14')}>
        {doctor?.profileImage && <AvatarImage src={doctor.profileImage} alt="" />}
        <AvatarFallback className={cn('bg-primary/10 font-semibold text-primary', size === 'sm' ? 'text-xs' : size === 'lg' && 'text-lg')}>
          {initialsOf(doctorName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className={cn('font-medium leading-tight', size === 'lg' && 'text-lg')}>{doctorName}</p>
        {size !== 'sm' && (subtitle ?? doctor?.specialization) && (
          <p className="truncate text-sm text-muted-foreground">{subtitle ?? doctor?.specialization}</p>
        )}
      </div>
    </div>
  )
}
