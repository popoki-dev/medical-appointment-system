import { doctorService, type DoctorFilters } from '@/services'
import { useAsync } from './useAsync'

export function useDoctors(filters: DoctorFilters = {}) {
  const { departmentId, status, search } = filters
  return useAsync(() => doctorService.getAll(filters), [departmentId, status, search], { watch: ['doctors'] })
}

export function useDoctor(id: string | undefined) {
  return useAsync(() => (id ? doctorService.getById(id) : Promise.resolve(undefined)), [id], { watch: ['doctors'] })
}

/** The doctor profile linked to a user account (e.g. the signed-in doctor). */
export function useDoctorByUserId(userId: string | undefined) {
  return useAsync(() => (userId ? doctorService.getByUserId(userId) : Promise.resolve(null)), [userId], {
    watch: ['doctors'],
  })
}

export function useDoctorSchedules(doctorId: string | undefined) {
  return useAsync(() => (doctorId ? doctorService.getSchedules(doctorId) : Promise.resolve([])), [doctorId], {
    watch: ['doctorSchedules'],
  })
}

/** Bookable slots for a doctor on a date ("yyyy-MM-dd"); refreshes as bookings change. */
export function useAvailableSlots(doctorId: string | undefined, date: string | undefined) {
  return useAsync(
    () => (doctorId && date ? doctorService.getAvailableSlots(doctorId, date) : Promise.resolve([])),
    [doctorId, date],
    { watch: ['appointments', 'doctorSchedules', 'doctors'] },
  )
}
