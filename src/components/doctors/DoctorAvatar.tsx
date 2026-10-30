import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, cn } from '@/lib/utils'
import type { Doctor } from '@/types'

/** Tints picked per doctor so initials avatars are easy to tell apart. */
const TINTS = [
  'from-blue-100 to-blue-50 text-blue-700',
  'from-teal-100 to-teal-50 text-teal-700',
  'from-indigo-100 to-indigo-50 text-indigo-700',
  'from-sky-100 to-sky-50 text-sky-700',
  'from-emerald-100 to-emerald-50 text-emerald-700',
]

const tintFor = (id: string) => TINTS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length]

export const doctorInitials = (fullName: string) => getInitials(fullName.replace(/^Dr\.?\s+/i, ''))

interface DoctorAvatarProps {
  doctor: Pick<Doctor, 'id' | 'fullName' | 'profileImage'>
  className?: string
}

/** The doctor's photo, or tinted initials when there is none. */
export function DoctorAvatar({ doctor, className }: DoctorAvatarProps) {
  return (
    <Avatar className={cn('h-14 w-14', className)}>
      {doctor.profileImage && <AvatarImage src={doctor.profileImage} alt={doctor.fullName} className="object-cover" />}
      <AvatarFallback className={cn('bg-gradient-to-br font-semibold', tintFor(doctor.id))} aria-label={doctor.fullName}>
        {doctorInitials(doctor.fullName)}
      </AvatarFallback>
    </Avatar>
  )
}
