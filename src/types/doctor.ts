export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Department {
  id: string
  name: string
  description: string
  icon: string
}

export interface WorkingHours {
  day: Weekday
  start: string // "HH:mm"
  end: string // "HH:mm"
}

export interface Doctor {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  departmentId: string
  specialization: string
  qualifications: string[]
  experienceYears: number
  consultationFee: number
  rating: number
  bio: string
  avatarUrl?: string
  workingHours: WorkingHours[]
  slotDurationMinutes: number
  isActive: boolean
}
