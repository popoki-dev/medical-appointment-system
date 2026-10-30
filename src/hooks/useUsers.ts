import { toAuthUser, userService, type UserFilters } from '@/services'
import { useAsync } from './useAsync'

/** Users with credentials stripped. */
export function useUsers(filters: UserFilters = {}) {
  const { role, status, search } = filters
  return useAsync(() => userService.getAll(filters).then((users) => users.map(toAuthUser)), [role, status, search], {
    watch: ['users'],
  })
}
