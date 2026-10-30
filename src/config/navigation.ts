import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
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
        { title: 'Find Doctors', href: ROUTES.patient.doctors, icon: Stethoscope },
        { title: 'My Appointments', href: ROUTES.patient.appointments, icon: CalendarDays },
        { title: 'Medical Information', href: ROUTES.patient.medical, icon: ClipboardList },
        { title: 'Notifications', href: ROUTES.patient.notifications, icon: Bell },
      ],
    },
    {
      label: 'Account',
      items: [
        { title: 'My Profile', href: ROUTES.patient.profile, icon: UserCircle },
        { title: 'Settings', href: ROUTES.patient.settings, icon: Settings },
      ],
    },
  ],
  doctor: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.doctor.dashboard, icon: LayoutDashboard },
        { title: 'My Appointments', href: ROUTES.doctor.appointments, icon: CalendarCheck },
        { title: 'My Schedule', href: ROUTES.doctor.schedule, icon: CalendarDays },
      ],
    },
    { label: 'Account', items: [{ title: 'Profile Settings', href: ROUTES.doctor.profile, icon: UserCircle }] },
  ],
  receptionist: [
    {
      items: [
        { title: 'Dashboard', href: ROUTES.receptionist.dashboard, icon: LayoutDashboard },
        { title: 'Appointments', href: ROUTES.receptionist.appointments, icon: CalendarDays },
        { title: 'Patients', href: ROUTES.receptionist.patients, icon: Users },
        { title: 'Doctor Availability', href: ROUTES.receptionist.doctors, icon: CalendarClock },
      ],
    },
    { label: 'Account', items: [{ title: 'Profile Settings', href: ROUTES.receptionist.profile, icon: UserCircle }] },
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
        { title: 'Users', href: ROUTES.admin.users, icon: UserCog },
        { title: 'Doctors', href: ROUTES.admin.doctors, icon: Stethoscope },
        { title: 'Departments', href: ROUTES.admin.departments, icon: Building2 },
        { title: 'Patients', href: ROUTES.admin.patients, icon: Users },
      ],
    },
    {
      label: 'System',
      items: [
        { title: 'System Settings', href: ROUTES.admin.settings, icon: Settings },
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
  { title: 'Contact', href: ROUTES.contact },
]
