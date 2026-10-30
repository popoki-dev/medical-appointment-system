import type { AppointmentStatus, StatusTone } from '@/types'

export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  'checked-in': { label: 'Checked in', tone: 'teal' },
  'in-progress': { label: 'In progress', tone: 'default' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  'no-show': { label: 'No-show', tone: 'neutral' },
}
