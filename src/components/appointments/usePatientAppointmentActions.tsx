import { useCallback, useState } from 'react'
import type { AppointmentDetails } from '@/types'
import { AppointmentDetailsModal } from './AppointmentDetailsModal'
import { CancelAppointmentDialog } from './CancelAppointmentDialog'

/**
 * The details modal and cancel confirmation shared by the patient's dashboard and
 * appointments page. Render `dialogs` once and call the actions from any row or card.
 */
export function usePatientAppointmentActions(patientId: string | undefined) {
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<AppointmentDetails | null>(null)

  const viewDetails = useCallback((appointment: AppointmentDetails) => setDetailsId(appointment.id), [])
  const requestCancel = useCallback((appointment: AppointmentDetails) => setCancelling(appointment), [])

  const dialogs = (
    <>
      <AppointmentDetailsModal appointmentId={detailsId} onOpenChange={(open) => !open && setDetailsId(null)} onCancel={requestCancel} />
      <CancelAppointmentDialog appointment={cancelling} patientId={patientId} onOpenChange={(open) => !open && setCancelling(null)} />
    </>
  )

  return { viewDetails, requestCancel, dialogs }
}
