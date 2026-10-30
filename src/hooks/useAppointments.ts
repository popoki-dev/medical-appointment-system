import { useAsync } from './useAsync'
import { appointmentService, type AppointmentFilters } from '@/services'

export function useAppointments(filters: AppointmentFilters = {}) {
  const { patientId, doctorId, date, status } = filters
  return useAsync(() => appointmentService.list(filters), [patientId, doctorId, date, status?.join(',')])
}
