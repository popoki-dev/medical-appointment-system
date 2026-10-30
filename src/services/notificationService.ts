import type { AppNotification } from '@/types'
import { createRepository, delay, type CreateInput } from './repository'
import { storageService } from './storageService'

const repo = createRepository('notifications', { idPrefix: 'ntf' })

export type NotifyInput = Omit<CreateInput<AppNotification>, 'isRead' | 'createdAt'>

export const notificationService = {
  getAll: repo.getAll,
  getById: repo.getById,

  getAllForUser: (userId: string) =>
    repo
      .getAll((n) => n.userId === userId)
      .then((items) => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),

  create: (input: NotifyInput) => repo.create({ ...input, isRead: false, createdAt: new Date().toISOString() }),

  /** Fire-and-forget notification used by other services; skips the simulated latency. */
  notify(input: NotifyInput) {
    storageService.insert('notifications', {
      ...input,
      id: `ntf_${crypto.randomUUID()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    })
  },

  update: (id: string, patch: Partial<Omit<AppNotification, 'id'>>) => repo.update(id, patch),
  markAsRead: (id: string) => repo.update(id, { isRead: true }),

  async markAllAsRead(userId: string) {
    await delay()
    const items = storageService.getAll('notifications')
    if (!items.some((n) => n.userId === userId && !n.isRead)) return
    storageService.setAll(
      'notifications',
      items.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)),
    )
  },

  delete: repo.delete,
}
