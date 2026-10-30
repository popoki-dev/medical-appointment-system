export type DepartmentStatus = 'active' | 'inactive'

export interface Department {
  id: string
  name: string
  description: string
  /** Name of a Lucide icon, e.g. "HeartPulse". */
  icon: string
  image: string | null
  status: DepartmentStatus
}
