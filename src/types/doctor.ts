export type DoctorStatus = 'active' | 'on-leave' | 'inactive'
/** 0 = Sunday … 6 = Saturday (matches `Date.getDay()`). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Doctor {
  id: string
  userId: string
  doctorNumber: string
  fullName: string
  departmentId: string
  specialization: string
  qualification: string
  /** Years of experience. */
  experience: number
  consultationFee: number
  languages: string[]
  biography: string
  profileImage: string | null
  /** Demo data. */
  rating: number
  status: DoctorStatus
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  dayOfWeek: DayOfWeek
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  /** Minutes per appointment slot. */
  slotDuration: number
  breakStart: string | null
  breakEnd: string | null
  isAvailable: boolean
}
