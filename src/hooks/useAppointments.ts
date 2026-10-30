import { appointmentService, type AppointmentFilters } from '@/services'
import { useAsync } from './useAsync'

const WATCH = ['appointments', 'patients', 'users', 'doctors', 'departments'] as const

/** Live list of appointments joined with patient, doctor and department details. */
export function useAppointments(filters: AppointmentFilters = {}, { enabled = true }: { enabled?: boolean } = {}) {
  const { patientId, doctorId, departmentId, date, from, to, status } = filters
  return useAsync(
    () => (enabled ? appointmentService.getAllWithDetails(filters) : Promise.resolve([])),
    [enabled, patientId, doctorId, departmentId, date, from, to, status?.join(',')],
    { watch: [...WATCH] },
  )
}

export function useAppointment(id: string | undefined) {
  return useAsync(() => (id ? appointmentService.getByIdWithDetails(id) : Promise.resolve(undefined)), [id], {
    watch: [...WATCH],
  })
}
