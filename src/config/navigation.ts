import {
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Palette,
  Settings,
  Stethoscope,
  UserCircle,
  UserCog,
  Users,
} from 'lucide-react'
import type { NavSection, UserRole } from '@/types'
import { ROUTES } from './routes'

export const NAVIGATION: Record<UserRole, NavSection[]> = {
  patient: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.patient.dashboard, icon: LayoutDashboard },
        { title: 'Book Appointment', href: ROUTES.patient.book, icon: CalendarPlus },
        { title: 'My Appointments', href: ROUTES.patient.appointments, icon: CalendarDays },
        { title: 'Medical Records', href: ROUTES.patient.records, icon: FileText },
      ],
    },
    { label: 'Account', items: [{ title: 'Profile', href: ROUTES.patient.profile, icon: UserCircle }] },
  ],
  doctor: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.doctor.dashboard, icon: LayoutDashboard },
        { title: 'My Schedule', href: ROUTES.doctor.schedule, icon: CalendarDays },
        { title: 'Appointments', href: ROUTES.doctor.appointments, icon: CalendarCheck },
        { title: 'Patients', href: ROUTES.doctor.patients, icon: Users },
      ],
    },
    { label: 'Account', items: [{ title: 'Profile', href: ROUTES.doctor.profile, icon: UserCircle }] },
  ],
  receptionist: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.receptionist.dashboard, icon: LayoutDashboard },
        { title: 'Appointments', href: ROUTES.receptionist.appointments, icon: CalendarDays },
        { title: 'Check-in', href: ROUTES.receptionist.checkIn, icon: ClipboardCheck },
      ],
    },
    {
      label: 'Directory',
      items: [
        { title: 'Patients', href: ROUTES.receptionist.patients, icon: Users },
        { title: 'Doctors', href: ROUTES.receptionist.doctors, icon: Stethoscope },
      ],
    },
  ],
  admin: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard },
        { title: 'Appointments', href: ROUTES.admin.appointments, icon: CalendarDays },
        { title: 'Reports', href: ROUTES.admin.reports, icon: BarChart3 },
      ],
    },
    {
      label: 'Management',
      items: [
        { title: 'Doctors', href: ROUTES.admin.doctors, icon: Stethoscope },
        { title: 'Patients', href: ROUTES.admin.patients, icon: Users },
        { title: 'Departments', href: ROUTES.admin.departments, icon: Building2 },
        { title: 'Users & Roles', href: ROUTES.admin.users, icon: UserCog },
      ],
    },
    {
      label: 'System',
      items: [
        { title: 'Settings', href: ROUTES.admin.settings, icon: Settings },
        { title: 'UI Kit', href: ROUTES.admin.uiKit, icon: Palette },
      ],
    },
  ],
}

export const PUBLIC_NAVIGATION = [
  { title: 'Home', href: ROUTES.home },
  { title: 'Find a Doctor', href: ROUTES.doctors },
  { title: 'Departments', href: ROUTES.departments },
  { title: 'About', href: ROUTES.about },
]
