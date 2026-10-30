import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import type { RouteHandle } from '@/components/layout/AppBreadcrumbs'
import { ROUTES } from '@/config/routes'
import { AdminLayout, DoctorLayout, PatientLayout, PublicLayout, ReceptionistLayout } from '@/layouts'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { RouteErrorPage } from '@/pages/errors/RouteErrorPage'
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage'
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { ComingSoonPage } from '@/pages/shared/ComingSoonPage'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'
import { lazyPage } from './lazyPage'

const crumb = (label: string): RouteHandle => ({ crumb: label })

/** A route whose screen is not built yet; shows a titled placeholder. */
const placeholder = (path: string, title: string, description?: string): RouteObject => ({
  path,
  handle: crumb(title),
  element: <ComingSoonPage title={title} description={description} />,
})

const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'doctors', element: <div className="container py-10"><ComingSoonPage title="Find a doctor" description="Search our specialists by department and availability." /></div> },
    { path: 'departments', element: <div className="container py-10"><ComingSoonPage title="Departments" description="Explore our clinical departments." /></div> },
    { path: 'about', element: <div className="container py-10"><ComingSoonPage title="About us" description="Our mission, people and facilities." /></div> },
    { path: 'login', element: <GuestRoute><LoginPage /></GuestRoute> },
    { path: 'register', element: <GuestRoute><RegisterPage /></GuestRoute> },
  ],
}

const patientRoutes: RouteObject = {
  path: 'patient',
  handle: crumb('Patient'),
  element: (
    <ProtectedRoute roles={['patient']}>
      <PatientLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to={ROUTES.patient.dashboard} replace /> },
    {
      path: 'dashboard',
      handle: crumb('Dashboard'),
      element: lazyPage(() => import('@/pages/patient/PatientDashboardPage'), 'PatientDashboardPage'),
    },
    placeholder('book', 'Book Appointment', 'Choose a department, doctor and time slot.'),
    placeholder('appointments', 'My Appointments', 'View, reschedule or cancel your bookings.'),
    placeholder('records', 'Medical Records', 'Visit summaries, prescriptions and lab results.'),
    placeholder('profile', 'Profile', 'Personal details, emergency contacts and preferences.'),
  ],
}

const doctorRoutes: RouteObject = {
  path: 'doctor',
  handle: crumb('Doctor'),
  element: (
    <ProtectedRoute roles={['doctor']}>
      <DoctorLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to={ROUTES.doctor.dashboard} replace /> },
    {
      path: 'dashboard',
      handle: crumb('Dashboard'),
      element: lazyPage(() => import('@/pages/doctor/DoctorDashboardPage'), 'DoctorDashboardPage'),
    },
    placeholder('schedule', 'My Schedule', 'Working hours, availability and time off.'),
    placeholder('appointments', 'Appointments', 'Your upcoming and past consultations.'),
    placeholder('patients', 'Patients', 'Patients under your care.'),
    placeholder('profile', 'Profile', 'Your professional profile.'),
  ],
}

const receptionistRoutes: RouteObject = {
  path: 'receptionist',
  handle: crumb('Front desk'),
  element: (
    <ProtectedRoute roles={['receptionist']}>
      <ReceptionistLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to={ROUTES.receptionist.dashboard} replace /> },
    {
      path: 'dashboard',
      handle: crumb('Dashboard'),
      element: lazyPage(() => import('@/pages/receptionist/ReceptionistDashboardPage'), 'ReceptionistDashboardPage'),
    },
    placeholder('appointments', 'Appointments', 'Book, reschedule and manage appointments for patients.'),
    placeholder('check-in', 'Check-in', 'Arrivals queue and patient check-in.'),
    placeholder('patients', 'Patients', 'Patient directory.'),
    placeholder('doctors', 'Doctors', 'Doctor directory and availability.'),
  ],
}

const adminRoutes: RouteObject = {
  path: 'admin',
  handle: crumb('Admin'),
  element: (
    <ProtectedRoute roles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to={ROUTES.admin.dashboard} replace /> },
    {
      path: 'dashboard',
      handle: crumb('Dashboard'),
      element: lazyPage(() => import('@/pages/admin/AdminDashboardPage'), 'AdminDashboardPage'),
    },
    placeholder('appointments', 'Appointments', 'Every appointment across the hospital.'),
    placeholder('reports', 'Reports', 'Utilisation, revenue and performance analytics.'),
    placeholder('doctors', 'Doctors', 'Manage doctors, specialities and schedules.'),
    placeholder('patients', 'Patients', 'Manage patient records.'),
    placeholder('departments', 'Departments', 'Configure clinical departments.'),
    placeholder('users', 'Users & Roles', 'Staff accounts and permissions.'),
    placeholder('settings', 'Settings', 'Hospital-wide configuration.'),
    {
      path: 'ui-kit',
      handle: crumb('UI Kit'),
      element: lazyPage(() => import('@/pages/admin/UiKitPage'), 'UiKitPage'),
    },
  ],
}

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      publicRoutes,
      patientRoutes,
      doctorRoutes,
      receptionistRoutes,
      adminRoutes,
      { path: 'unauthorized', element: <UnauthorizedPage /> },
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
