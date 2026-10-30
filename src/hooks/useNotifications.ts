import { notificationService } from '@/services'
import { useAsync } from './useAsync'

export function useNotifications(userId: string | undefined) {
  return useAsync(() => (userId ? notificationService.getAllForUser(userId) : Promise.resolve([])), [userId], {
    watch: ['notifications'],
  })
}
