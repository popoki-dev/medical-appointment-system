import type { UserRole } from '@/types'

export const ROUTES = {
  home: '/',
  doctors: '/doctors',
  departments: '/departments',
  about: '/about',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',

  patient: {
    root: '/patient',
    dashboard: '/patient/dashboard',
    doctors: '/patient/doctors',
    book: '/patient/book',
    appointments: '/patient/appointments',
    profile: '/patient/profile',
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
