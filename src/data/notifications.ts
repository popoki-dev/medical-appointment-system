import { subHours, subMinutes } from 'date-fns'
import type { AppNotification } from '@/types'
import { mockUsers } from './users'

export function generateMockNotifications(now = new Date()): AppNotification[] {
  return mockUsers.flatMap((user) => [
    {
      id: `ntf_${user.id}_1`,
      userId: user.id,
      title: 'Appointment confirmed',
      message: 'Your appointment for tomorrow at 10:00 AM has been confirmed.',
      type: 'appointment' as const,
      read: false,
      createdAt: subMinutes(now, 12).toISOString(),
    },
    {
      id: `ntf_${user.id}_2`,
      userId: user.id,
      title: 'Reminder',
      message: 'Please arrive 15 minutes early to complete check-in.',
      type: 'reminder' as const,
      read: false,
      createdAt: subHours(now, 3).toISOString(),
    },
    {
      id: `ntf_${user.id}_3`,
      userId: user.id,
      title: 'System maintenance',
      message: 'Scheduled maintenance this Sunday from 2:00–3:00 AM.',
      type: 'system' as const,
      read: true,
      createdAt: subHours(now, 26).toISOString(),
    },
  ])
}
