import { patientService } from '@/services'
import { useAuth } from './useAuth'
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

/** The signed-in user's patient profile. `undefined` while loading, `null` if there is none. */
export function useCurrentPatient() {
  const { user } = useAuth()
  return usePatientByUserId(user?.role === 'patient' ? user.id : undefined)
}
