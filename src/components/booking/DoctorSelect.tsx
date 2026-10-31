import { Briefcase, UserX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { DoctorAvatar, NextAvailable } from '@/components/doctors'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKING_CONFIG } from '@/config/booking'
import { formatCurrency } from '@/lib/format'
import type { DoctorAvailability } from '@/services'
import type { Doctor } from '@/types'
import { SelectableCard } from './SelectableCard'

interface DoctorSelectProps {
  doctors: Doctor[] | undefined
  availability: Record<string, DoctorAvailability> | undefined
  value?: string
  onChange: (doctorId: string) => void
}

const openSlots = (availability: DoctorAvailability | undefined) =>
  availability ? Object.values(availability.freeByDate).reduce((sum, n) => sum + n, 0) : undefined

/** Step 2: the department's active doctors with their fee and next opening. */
export function DoctorSelect({ doctors, availability, value, onChange }: DoctorSelectProps) {
  if (!doctors) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    )
  }
  if (!doctors.length) {
    return <EmptyState icon={UserX} title="No doctors available" description="No doctor in this department is taking bookings. Try another department." />
  }
  return (
    <div role="radiogroup" aria-label="Doctor" className="grid gap-3 md:grid-cols-2">
      {doctors.map((doctor) => {
        const free = openSlots(availability?.[doctor.id])
        return (
          <SelectableCard key={doctor.id} selected={doctor.id === value} disabled={free === 0} onSelect={() => onChange(doctor.id)}>
            <div className="flex w-full gap-4 pr-6">
              <DoctorAvatar doctor={doctor} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div>
                  <p className="font-semibold leading-tight">{doctor.fullName}</p>
                  <p className="text-sm text-primary">{doctor.specialization}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {doctor.experience} years' experience
                  </span>
                  <span>
                    Fee <span className="font-semibold text-foreground">{formatCurrency(doctor.consultationFee)}</span>
                  </span>
                </div>
                <NextAvailable availability={availability?.[doctor.id]} emptyLabel={`Fully booked for the next ${BOOKING_CONFIG.horizonDays} days`} />
                {!!free && (
                  <p className="text-xs text-muted-foreground">
                    {free} open {free === 1 ? 'slot' : 'slots'} in the next {BOOKING_CONFIG.horizonDays} days
                  </p>
                )}
              </div>
            </div>
          </SelectableCard>
        )
      })}
    </div>
  )
}
