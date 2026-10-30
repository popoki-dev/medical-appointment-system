import type { UserRole } from '@/types'

export interface BookingPrefill {
  departmentId?: string
  doctorId?: string
  date?: string // "yyyy-MM-dd"
  time?: string // "HH:mm"
}

export const ROUTES = {
  home: '/',
  doctors: '/doctors',
  doctorProfile: (id: string) => `/doctors/${id}`,
  departments: '/departments',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  patient: {
    root: '/patient',
    dashboard: '/patient/dashboard',
    doctors: '/patient/doctors',
    book: '/patient/book',
    /** The booking flow, optionally pre-filled with a department, doctor, date and time. */
    bookWith: (params: BookingPrefill = {}) => {
      const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => !!entry[1]))
      const search = query.toString()
      return search ? `/patient/book?${search}` : '/patient/book'
    },
    appointments: '/patient/appointments',
    medical: '/patient/medical',
    notifications: '/patient/notifications',
    profile: '/patient/profile',
    settings: '/patient/settings',
  },
  doctor: {
    root: '/doctor',
    dashboard: '/doctor/dashboard',
    appointments: '/doctor/appointments',
    appointmentDetails: (id: string) => `/doctor/appointments/${id}`,
    schedule: '/doctor/schedule',
    profile: '/doctor/profile',
  },
  receptionist: {
    root: '/receptionist',
    dashboard: '/receptionist/dashboard',
    patients: '/receptionist/patients',
    appointments: '/receptionist/appointments',
    doctors: '/receptionist/doctors',
    profile: '/receptionist/profile',
  },
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    doctors: '/admin/doctors',
    departments: '/admin/departments',
    patients: '/admin/patients',
    appointments: '/admin/appointments',
    reports: '/admin/reports',
    settings: '/admin/settings',
    uiKit: '/admin/ui-kit',
  },
} as const

export const ROLE_HOME: Record<UserRole, string> = {
  patient: ROUTES.patient.dashboard,
  doctor: ROUTES.doctor.dashboard,
  receptionist: ROUTES.receptionist.dashboard,
  admin: ROUTES.admin.dashboard,
}

export const ROLE_LABEL: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  admin: 'Administrator',
}
