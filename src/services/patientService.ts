import type { AuthUser, Patient, User } from '@/types'
import { createRepository, delay, nextSequence, ServiceError, type CreateInput } from './repository'
import { storageService } from './storageService'
import { toAuthUser, userService } from './userService'

const repo = createRepository('patients', {
  idPrefix: 'pat',
  unique: [
    { key: (p) => p.userId, message: 'This user already has a patient profile' },
    { key: (p) => p.patientNumber, message: 'Patient number already in use' },
  ],
})

export interface PatientWithUser extends Patient {
  user: AuthUser | null
  fullName: string
}

const withUser = (patient: Patient): PatientWithUser => {
  const user = storageService.getById('users', patient.userId)
  return { ...patient, user: user ? toAuthUser(user) : null, fullName: user?.fullName ?? 'Unknown patient' }
}

export type RegisterPatientInput = Pick<User, 'fullName' | 'email' | 'phone' | 'password'> &
  Omit<CreateInput<Patient>, 'userId' | 'patientNumber'>

export const patientService = {
  getAll: repo.getAll,

  async getAllWithUser(search?: string): Promise<PatientWithUser[]> {
    const patients = (await repo.getAll()).map(withUser)
    if (!search) return patients
    const q = search.toLowerCase()
    return patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.patientNumber.toLowerCase().includes(q) || p.user?.email.toLowerCase().includes(q),
    )
  },

  getById: repo.getById,

  async getByUserId(userId: string) {
    await delay()
    return storageService.getAll('patients').find((p) => p.userId === userId) ?? null
  },

  /** Creates the user account and patient profile together. */
  async register({ fullName, email, phone, password, ...profile }: RegisterPatientInput) {
    const user = await userService.create({ fullName, email, phone, password, role: 'patient' })
    const patientNumber = nextSequence(storageService.getAll('patients').map((p) => p.patientNumber), 'PAT-', 5)
    try {
      return await repo.create({ ...profile, userId: user.id, patientNumber })
    } catch (error) {
      storageService.remove('users', user.id) // don't leave an account without a profile
      throw error
    }
  },

  create: (input: Omit<CreateInput<Patient>, 'patientNumber'>) =>
    repo.create({
      ...input,
      patientNumber: nextSequence(storageService.getAll('patients').map((p) => p.patientNumber), 'PAT-', 5),
    }),

  update: (id: string, patch: Partial<Omit<Patient, 'id' | 'userId' | 'patientNumber'>>) => repo.update(id, patch),

  async delete(id: string) {
    if (storageService.getAll('appointments').some((a) => a.patientId === id)) {
      throw new ServiceError('This patient has appointments on record and cannot be deleted.', 'CONFLICT')
    }
    await repo.delete(id)
  },
}
