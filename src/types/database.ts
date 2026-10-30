import type { Appointment } from './appointment'
import type { Department } from './department'
import type { Doctor, DoctorSchedule } from './doctor'
import type { AppNotification } from './notification'
import type { Patient } from './patient'
import type { User } from './user'

/** Shape of the whole localStorage-backed dataset. Each key is one collection. */
export interface Database {
  users: User[]
  patients: Patient[]
  departments: Department[]
  doctors: Doctor[]
  doctorSchedules: DoctorSchedule[]
  appointments: Appointment[]
  notifications: AppNotification[]
}

export type CollectionName = keyof Database
export type EntityOf<C extends CollectionName> = Database[C][number]
