import { generateMockNotifications } from '@/data'
import type { AppNotification } from '@/types'
import { LocalCollection } from './mockClient'

const notifications = new LocalCollection<AppNotification>('notifications', () => generateMockNotifications())

export const notificationService = {
  listForUser: (userId: string) =>
    notifications
      .list((n) => n.userId === userId)
      .then((items) => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  markAsRead: (id: string) => notifications.update(id, { read: true }),
  async markAllAsRead(userId: string) {
    const unread = await notifications.list((n) => n.userId === userId && !n.read)
    await Promise.all(unread.map((n) => notifications.update(n.id, { read: true })))
  },
}
