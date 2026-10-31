import type { ReactNode } from 'react'
import { BadgeDollarSign, Building2, CalendarDays, Clock, MessageSquareText, Stethoscope, UserRound } from 'lucide-react'
import { DoctorAvatar } from '@/components/doctors'
import { formatDate, formatTime } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Department, Doctor, TimeSlot } from '@/types'

export interface BookingSummaryData {
  patientName?: string
  department?: Department
  doctor?: Doctor
  date?: string
  slot?: Pick<TimeSlot, 'startTime' | 'endTime'>
  reason?: string
}

/** What has been chosen so far. Used as the wizard's sidebar and on the review step. */
export function BookingSummary({ data, variant = 'compact', className }: { data: BookingSummaryData; variant?: 'compact' | 'full'; className?: string }) {
  const { patientName, department, doctor, date, slot, reason } = data
  return (
    <dl className={cn('space-y-4 text-sm', className)}>
      {variant === 'full' && <Row icon={UserRound} label="Patient" value={patientName} />}
      <Row
        icon={Stethoscope}
        label="Doctor"
        value={
          doctor && (
            <span className="flex items-center gap-2">
              {variant === 'full' && <DoctorAvatar doctor={doctor} className="h-8 w-8 text-xs" />}
              <span>
                {doctor.fullName}
                <span className="block text-xs font-normal text-muted-foreground">{doctor.specialization}</span>
              </span>
            </span>
          )
        }
      />
      <Row icon={Building2} label="Department" value={department?.name} />
      <Row icon={CalendarDays} label="Date" value={date && formatDate(date, 'EEEE, MMMM d, yyyy')} />
      <Row icon={Clock} label="Time" value={slot && `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`} />
      <Row
        icon={BadgeDollarSign}
        label="Consultation fee"
        value={
          doctor && (
            <>
              {formatCurrency(doctor.consultationFee)}
              <span className="block text-xs font-normal text-muted-foreground">Payable at the hospital. No online payment.</span>
            </>
          )
        }
      />
      {variant === 'full' && <Row icon={MessageSquareText} label="Reason for visit" value={reason} />}
    </dl>
  )
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn('font-medium', !value && 'font-normal text-muted-foreground')}>{value || 'Not selected yet'}</dd>
      </div>
    </div>
  )
}
