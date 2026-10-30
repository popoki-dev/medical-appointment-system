import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import type { RouteHandle } from '@/components/layout/AppBreadcrumbs'
import { ROLE_HOME } from '@/config/routes'
import { AdminLayout, DoctorLayout, PatientLayout, PublicLayout, ReceptionistLayout } from '@/layouts'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { RouteErrorPage } from '@/pages/errors/RouteErrorPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { ComingSoonPage } from '@/pages/shared/ComingSoonPage'
import type { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'
import { RootLayout } from './RootLayout'
import { lazyPage } from './lazyPage'

const crumb = (label: string): RouteHandle => ({ crumb: label })

interface PageRoute {
  path: string
  title: string
  permission: Permission
  /** Omit for screens that are not built yet; a titled placeholder is shown. */
  element?: ReactNode
  description?: string
}

/** A portal page, guarded by the permission it needs on top of its portal's role check. */
const page = ({ path, title, permission, element, description }: PageRoute): RouteObject => ({
  path,
  handle: crumb(title),
  element: (
    <ProtectedRoute permission={permission}>
      {element ?? <ComingSoonPage title={title} description={description} />}
    </ProtectedRoute>
  ),
})

/** A role's portal: its layout behind a role check, with `/<role>` redirecting to the dashboard. */
const portal = (role: UserRole, label: string, layout: ReactNode, children: RouteObject[]): RouteObject => ({
  path: role,
  handle: crumb(label),
  element: <ProtectedRoute roles={[role]}>{layout}</ProtectedRoute>,
  children: [{ index: true, element: <Navigate to={ROLE_HOME[role]} replace /> }, ...children],
})

const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'doctors', element: lazyPage(() => import('@/pages/public/DoctorsPage'), 'DoctorsPage') },
    { path: 'doctors/:doctorId', element: lazyPage(() => import('@/pages/public/DoctorProfilePage'), 'DoctorProfilePage') },
    { path: 'departments', element: lazyPage(() => import('@/pages/public/DepartmentsPage'), 'DepartmentsPage') },
    { path: 'about', element: lazyPage(() => import('@/pages/public/AboutPage'), 'AboutPage') },
    { path: 'contact', element: lazyPage(() => import('@/pages/public/ContactPage'), 'ContactPage') },
    { path: 'login', element: <GuestRoute><LoginPage /></GuestRoute> },
    { path: 'register', element: <GuestRoute><RegisterPage /></GuestRoute> },
    { path: 'forgot-password', element: <GuestRoute><ForgotPasswordPage /></GuestRoute> },
  ],
}

const patientRoutes = portal('patient', 'Patient', <PatientLayout />, [
  page({
    path: 'dashboard',
    title: 'Dashboard',
    permission: 'dashboard:patient',
    element: lazyPage(() => import('@/pages/patient/PatientDashboardPage'), 'PatientDashboardPage'),
  }),
  page({ path: 'book', title: 'Book Appointment', permission: 'appointments:book', description: 'Choose a department, doctor and time slot.' }),
  page({
    path: 'doctors',
    title: 'Find Doctors',
    permission: 'doctors:browse',
    element: lazyPage(() => import('@/pages/patient/FindDoctorsPage'), 'FindDoctorsPage'),
  }),
  page({
    path: 'appointments',
    title: 'My Appointments',
    permission: 'appointments:view-own',
    element: lazyPage(() => import('@/pages/patient/MyAppointmentsPage'), 'MyAppointmentsPage'),
  }),
  page({
    path: 'medical',
    title: 'Medical Information',
    permission: 'medical-info:view-own',
    element: lazyPage(() => import('@/pages/patient/MedicalInformationPage'), 'MedicalInformationPage'),
  }),
  page({
    path: 'notifications',
    title: 'Notifications',
    permission: 'notifications:view-own',
    element: lazyPage(() => import('@/pages/patient/NotificationsPage'), 'NotificationsPage'),
  }),
  page({
    path: 'profile',
    title: 'My Profile',
    permission: 'profile:manage',
    element: lazyPage(() => import('@/pages/patient/PatientProfilePage'), 'PatientProfilePage'),
  }),
  page({
    path: 'settings',
    title: 'Settings',
    permission: 'profile:manage',
    element: lazyPage(() => import('@/pages/patient/PatientSettingsPage'), 'PatientSettingsPage'),
  }),
])

const doctorRoutes = portal('doctor', 'Doctor', <DoctorLayout />, [
  page({
    path: 'dashboard',
    title: 'Dashboard',
    permission: 'dashboard:doctor',
    element: lazyPage(() => import('@/pages/doctor/DoctorDashboardPage'), 'DoctorDashboardPage'),
  }),
  {
    path: 'appointments',
    handle: crumb('My Appointments'),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute permission="appointments:view-assigned">
            <ComingSoonPage title="My Appointments" description="Your upcoming and past consultations." />
          </ProtectedRoute>
        ),
      },
      page({ path: ':appointmentId', title: 'Appointment Details', permission: 'appointments:view-assigned', description: 'Patient details, visit reason and appointment history.' }),
    ],
  },
  page({ path: 'schedule', title: 'My Schedule', permission: 'schedule:manage-own', description: 'Working hours, breaks and availability.' }),
  page({ path: 'profile', title: 'Profile Settings', permission: 'profile:manage', description: 'Your professional profile and password.' }),
])

const receptionistRoutes = portal('receptionist', 'Front desk', <ReceptionistLayout />, [
  page({
    path: 'dashboard',
    title: 'Dashboard',
    permission: 'dashboard:reception',
    element: lazyPage(() => import('@/pages/receptionist/ReceptionistDashboardPage'), 'ReceptionistDashboardPage'),
  }),
  page({ path: 'patients', title: 'Patients', permission: 'patients:manage', description: 'Register patients and update their details.' }),
  page({ path: 'appointments', title: 'Appointments', permission: 'appointments:manage', description: 'Book, confirm, reschedule and cancel appointments.' }),
  page({ path: 'doctors', title: 'Doctor Availability', permission: 'doctors:view-availability', description: 'Doctor schedules and free time slots.' }),
  page({ path: 'profile', title: 'Profile Settings', permission: 'profile:manage', description: 'Your account details and password.' }),
])

const adminRoutes = portal('admin', 'Admin', <AdminLayout />, [
  page({
    path: 'dashboard',
    title: 'Dashboard',
    permission: 'dashboard:admin',
    element: lazyPage(() => import('@/pages/admin/AdminDashboardPage'), 'AdminDashboardPage'),
  }),
  page({ path: 'users', title: 'Users', permission: 'users:manage', description: 'Staff and patient accounts, roles and status.' }),
  page({ path: 'doctors', title: 'Doctors', permission: 'doctors:manage', description: 'Manage doctors, specialities and schedules.' }),
  page({ path: 'departments', title: 'Departments', permission: 'departments:manage', description: 'Configure clinical departments.' }),
  page({ path: 'patients', title: 'Patients', permission: 'patients:manage', description: 'Manage patient records.' }),
  page({ path: 'appointments', title: 'Appointments', permission: 'appointments:manage', description: 'Every appointment across the hospital.' }),
  page({ path: 'reports', title: 'Reports', permission: 'reports:view', description: 'Utilisation, revenue and performance analytics.' }),
  page({ path: 'settings', title: 'System Settings', permission: 'settings:manage', description: 'Hospital-wide configuration.' }),
  page({
    path: 'ui-kit',
    title: 'UI Kit',
    permission: 'settings:manage',
    element: lazyPage(() => import('@/pages/admin/UiKitPage'), 'UiKitPage'),
  }),
])

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      publicRoutes,
      patientRoutes,
      doctorRoutes,
      receptionistRoutes,
      adminRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
})
