import { mockPatients } from '@/data'
import type { Patient } from '@/types'
import { LocalCollection } from './mockClient'

const patients = new LocalCollection<Patient>('patients', () => mockPatients)

export const patientService = {
  list: (search?: string) =>
    patients.list((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    }),
  get: (id: string) => patients.get(id),
  getByUserId: async (userId: string) => (await patients.list((p) => p.userId === userId))[0] ?? null,
  create: (patient: Patient) => patients.create(patient),
  update: (id: string, patch: Partial<Patient>) => patients.update(id, patch),
}
