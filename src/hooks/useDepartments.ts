import { departmentService } from '@/services'
import type { DepartmentStatus } from '@/types'
import { useAsync } from './useAsync'

export function useDepartments(status?: DepartmentStatus) {
  return useAsync(() => departmentService.getAll(status), [status], { watch: ['departments'] })
}
