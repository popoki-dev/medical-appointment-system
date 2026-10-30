import { mockDoctors } from '@/data'
import type { Doctor } from '@/types'
import { LocalCollection } from './mockClient'

const doctors = new LocalCollection<Doctor>('doctors', () => mockDoctors)

export interface DoctorFilters {
  departmentId?: string
  search?: string
}

export const doctorService = {
  list: ({ departmentId, search }: DoctorFilters = {}) =>
    doctors.list((d) => {
      if (!d.isActive) return false
      if (departmentId && d.departmentId !== departmentId) return false
      if (search) {
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
      }
      return true
    }),
  get: (id: string) => doctors.get(id),
  getByUserId: async (userId: string) => (await doctors.list((d) => d.userId === userId))[0] ?? null,
  update: (id: string, patch: Partial<Doctor>) => doctors.update(id, patch),
}
