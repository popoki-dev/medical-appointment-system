import type { Department } from './department'
import type { Doctor } from './doctor'
import type { Patient } from './patient'
import type { AuthUser } from './user'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no-show'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface Appointment {
  id: string
  appointmentNumber: string
  patientId: string
  doctorId: string
  departmentId: string
  appointmentDate: string // "yyyy-MM-dd"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  reason: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
}

/** An appointment joined with the records it references, for display. */
export interface AppointmentDetails extends Appointment {
  patientName: string
  patient: Patient | null
  patientUser: AuthUser | null
  doctorName: string
  doctor: Doctor | null
  departmentName: string
  department: Department | null
}

export interface TimeSlot {
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  available: boolean
}
