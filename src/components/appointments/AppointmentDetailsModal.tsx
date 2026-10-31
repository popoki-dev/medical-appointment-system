import type { ReactNode } from 'react'
import { Ban } from 'lucide-react'
import { LoadingState } from '@/components/common/LoadingState'
import { Modal } from '@/components/common/Modal'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { PAYMENT_STATUS_META } from '@/config/status'
import { useAppointment } from '@/hooks/useAppointments'
import { formatDate, formatTime } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { canPatientCancel } from '@/services'
import type { AppointmentDetails } from '@/types'
import { AppointmentDoctor } from './AppointmentDoctor'

const STATUS_NOTE: Partial<Record<AppointmentDetails['status'], string>> = {
  pending: 'Awaiting confirmation from the hospital. You will be notified once it is confirmed.',
  confirmed: 'Confirmed. Please arrive 15 minutes early to check in at reception.',
  cancelled: 'This appointment was cancelled.',
  rejected: 'This request was declined. Please book another time.',
  'no-show': 'This appointment was missed.',
}

interface AppointmentDetailsModalProps {
  appointmentId: string | null
  onOpenChange: (open: boolean) => void
  onCancel: (appointment: AppointmentDetails) => void
}

/** Full details of one appointment. Reads live, so a cancellation shows straight away. */
export function AppointmentDetailsModal({ appointmentId, onOpenChange, onCancel }: AppointmentDetailsModalProps) {
  const { data: appointment, isLoading } = useAppointment(appointmentId ?? undefined)
  const note = appointment && STATUS_NOTE[appointment.status]

  return (
    <Modal
      open={!!appointmentId}
      onOpenChange={onOpenChange}
      title="Appointment details"
      description={appointment?.appointmentNumber}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {appointment && canPatientCancel(appointment) && (
            <Button variant="destructive" onClick={() => onCancel(appointment)}>
              <Ban /> Cancel appointment
            </Button>
          )}
        </>
      }
    >
      {isLoading || !appointment ? (
        <LoadingState className="py-10" />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AppointmentDoctor appointment={appointment} size="lg" />
            <StatusBadge status={appointment.status} />
          </div>
          {note && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{note}</p>}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Detail label="Appointment number" value={<span className="font-mono">{appointment.appointmentNumber}</span>} />
            <Detail label="Department" value={appointment.departmentName} />
            <Detail label="Date" value={formatDate(appointment.appointmentDate, 'EEEE, MMMM d, yyyy')} />
            <Detail label="Time" value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`} />
            {appointment.doctor && <Detail label="Consultation fee" value={formatCurrency(appointment.doctor.consultationFee)} />}
            <Detail
              label="Payment"
              value={
                <StatusBadge
                  label={PAYMENT_STATUS_META[appointment.paymentStatus].label}
                  tone={PAYMENT_STATUS_META[appointment.paymentStatus].tone}
                />
              }
            />
            <Detail label="Reason for visit" value={appointment.reason} className="sm:col-span-2" />
            {appointment.notes && <Detail label="Additional notes" value={appointment.notes} className="sm:col-span-2" />}
            {appointment.contact && (
              <Detail label="Contact for this visit" value={`${appointment.contact.phone} · ${appointment.contact.email}`} className="sm:col-span-2" />
            )}
            <Detail label="Booked" value={formatDate(appointment.createdAt, 'MMM d, yyyy · h:mm a')} />
            <Detail label="Last updated" value={formatDate(appointment.updatedAt, 'MMM d, yyyy · h:mm a')} />
          </dl>
        </div>
      )}
    </Modal>
  )
}

function Detail({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}
