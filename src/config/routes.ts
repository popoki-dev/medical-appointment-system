import type { UserRole } from '@/types'

export const ROUTES = {
  home: '/',
  doctors: '/doctors',
  departments: '/departments',
  about: '/about',
  login: '/login',
  register: '/register',
  unauthorized: '/unauthorized',

  patient: {
    root: '/patient',
    dashboard: '/patient/dashboard',
    book: '/patient/book',
    appointments: '/patient/appointments',
    records: '/patient/records',
    profile: '/patient/profile',
  },
  doctor: {
    root: '/doctor',
    dashboard: '/doctor/dashboard',
    schedule: '/doctor/schedule',
    appointments: '/doctor/appointments',
    patients: '/doctor/patients',
    profile: '/doctor/profile',
  },
  receptionist: {
    root: '/receptionist',
    dashboard: '/receptionist/dashboard',
    appointments: '/receptionist/appointments',
    checkIn: '/receptionist/check-in',
    patients: '/receptionist/patients',
    doctors: '/receptionist/doctors',
  },
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    appointments: '/admin/appointments',
    doctors: '/admin/doctors',
    patients: '/admin/patients',
    departments: '/admin/departments',
    users: '/admin/users',
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
