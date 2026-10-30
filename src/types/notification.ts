export type NotificationType = 'appointment' | 'reminder' | 'system' | 'alert'

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}
