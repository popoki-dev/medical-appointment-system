export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export type AppointmentType = 'consultation' | 'follow-up' | 'check-up' | 'emergency'

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  departmentId: string
  date: string // "yyyy-MM-dd"
  time: string // "HH:mm"
  durationMinutes: number
  type: AppointmentType
  status: AppointmentStatus
  reason: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  time: string // "HH:mm"
  available: boolean
}
