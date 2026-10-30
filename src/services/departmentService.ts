import type { Department, DepartmentStatus } from '@/types'
import { caseInsensitive, createRepository, ServiceError, type CreateInput } from './repository'
import { storageService } from './storageService'

const repo = createRepository('departments', {
  idPrefix: 'dep',
  unique: [{ key: (d) => caseInsensitive(d.name), message: 'A department with this name already exists' }],
})

export const departmentService = {
  getAll: (status?: DepartmentStatus) => repo.getAll((d) => !status || d.status === status),
  getById: repo.getById,
  create: (input: CreateInput<Department>) => repo.create(input),
  update: (id: string, patch: Partial<Omit<Department, 'id'>>) => repo.update(id, patch),

  async delete(id: string) {
    if (storageService.getAll('doctors').some((d) => d.departmentId === id)) {
      throw new ServiceError('Move or remove this department’s doctors before deleting it.', 'CONFLICT')
    }
    await repo.delete(id)
  },
}
