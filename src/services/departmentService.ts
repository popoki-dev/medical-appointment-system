import { mockDepartments } from '@/data'
import type { Department } from '@/types'
import { LocalCollection } from './mockClient'

const departments = new LocalCollection<Department>('departments', () => mockDepartments)

export const departmentService = {
  list: () => departments.list(),
  get: (id: string) => departments.get(id),
}
