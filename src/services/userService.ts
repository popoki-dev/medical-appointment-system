import type { AuthUser, User, UserRole, UserStatus } from '@/types'
import { caseInsensitive, createRepository, delay, ServiceError, type CreateInput } from './repository'
import { storageService } from './storageService'

const repo = createRepository('users', {
  idPrefix: 'usr',
  unique: [{ key: (u) => caseInsensitive(u.email), message: 'An account with this email already exists' }],
})

export const toAuthUser = ({ password: _password, ...user }: User): AuthUser => user

export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  search?: string
}

export const userService = {
  getAll: ({ role, status, search }: UserFilters = {}) =>
    repo.getAll((u) => {
      if (role && u.role !== role) return false
      if (status && u.status !== status) return false
      if (search) {
        const q = caseInsensitive(search)
        return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      }
      return true
    }),

  getById: repo.getById,

  async getByEmail(email: string) {
    await delay()
    return storageService.getAll('users').find((u) => caseInsensitive(u.email) === caseInsensitive(email)) ?? null
  },

  create: (input: Omit<CreateInput<User>, 'createdAt' | 'status' | 'profileImage'> & Partial<Pick<User, 'status' | 'profileImage'>>) =>
    repo.create({
      status: 'active',
      profileImage: null,
      ...input,
      email: input.email.trim(),
      createdAt: new Date().toISOString(),
    }),

  async update(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>) {
    const user = await repo.update(id, patch)
    // Doctors keep a denormalised copy of their name and photo.
    if (user.role === 'doctor' && (patch.fullName !== undefined || patch.profileImage !== undefined)) {
      const doctor = storageService.getAll('doctors').find((d) => d.userId === id)
      if (doctor) storageService.update('doctors', doctor.id, { fullName: user.fullName, profileImage: user.profileImage })
    }
    return user
  },

  /**
   * Deletes a user together with their notifications and patient/doctor profile.
   * Refused while the profile still has appointments — deactivate the user instead.
   */
  async delete(id: string) {
    const patient = storageService.getAll('patients').find((p) => p.userId === id)
    const doctor = storageService.getAll('doctors').find((d) => d.userId === id)
    const hasAppointments = storageService
      .getAll('appointments')
      .some((a) => (patient && a.patientId === patient.id) || (doctor && a.doctorId === doctor.id))
    if (hasAppointments) {
      throw new ServiceError('This user has appointments on record. Set their status to inactive instead.', 'CONFLICT')
    }
    await repo.delete(id)
    if (patient) storageService.remove('patients', patient.id)
    if (doctor) {
      storageService.remove('doctors', doctor.id)
      storageService.removeWhere('doctorSchedules', (s) => s.doctorId === doctor.id)
    }
    storageService.removeWhere('notifications', (n) => n.userId === id)
  },
}
