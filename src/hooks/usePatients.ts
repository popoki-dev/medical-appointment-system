import { patientService } from '@/services'
import { useAsync } from './useAsync'

/** Patients joined with their user account (name, email, phone). */
export function usePatients(search?: string) {
  return useAsync(() => patientService.getAllWithUser(search), [search], { watch: ['patients', 'users'] })
}

/** The patient profile linked to a user account (e.g. the signed-in patient). */
export function usePatientByUserId(userId: string | undefined) {
  return useAsync(() => (userId ? patientService.getByUserId(userId) : Promise.resolve(null)), [userId], {
    watch: ['patients'],
  })
}
