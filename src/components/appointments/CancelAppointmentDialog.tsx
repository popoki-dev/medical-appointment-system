import { ConfirmationDialog } from '@/components/common/ConfirmationDialog'
import { formatDate, formatTime } from '@/lib/date'
import { toast } from '@/lib/toast'
import { appointmentService } from '@/services'
import type { AppointmentDetails } from '@/types'

interface CancelAppointmentDialogProps {
  appointment: AppointmentDetails | null
  patientId: string | undefined
  onOpenChange: (open: boolean) => void
}

/** Asks the patient to confirm, then cancels the appointment and notifies them and the doctor. */
export function CancelAppointmentDialog({ appointment, patientId, onOpenChange }: CancelAppointmentDialogProps) {
  const cancel = async () => {
    if (!appointment || !patientId) return
    try {
      await appointmentService.cancelByPatient(appointment.id, patientId)
      toast.success('Appointment cancelled', `${appointment.appointmentNumber} with ${appointment.doctorName} has been cancelled.`)
    } catch (error) {
      toast.error('Could not cancel appointment', (error as Error).message)
    }
  }

  return (
    <ConfirmationDialog
      open={!!appointment}
      onOpenChange={onOpenChange}
      variant="destructive"
      title="Cancel this appointment?"
      description={
        appointment && (
          <>
            Your appointment <span className="font-medium text-foreground">{appointment.appointmentNumber}</span> with{' '}
            <span className="font-medium text-foreground">{appointment.doctorName}</span> on{' '}
            {formatDate(appointment.appointmentDate, 'EEEE, MMM d')} at {formatTime(appointment.startTime)} will be cancelled and the
            time slot released. This can't be undone.
          </>
        )
      }
      confirmLabel="Cancel appointment"
      cancelLabel="Keep appointment"
      onConfirm={cancel}
    />
  )
}
