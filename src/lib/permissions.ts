import { matchPath } from 'react-router-dom'
import { ROLE_HOME, ROUTES } from '@/config/routes'
import type { AuthUser, UserRole } from '@/types'

/**
 * Everything a signed-in user can be allowed to do. Routes, navigation and
 * components check permissions rather than role names, so changing who can do
 * what only means editing `ROLE_PERMISSIONS`.
 */
export type Permission =
  | 'dashboard:patient'
  | 'dashboard:doctor'
  | 'dashboard:reception'
  | 'dashboard:admin'
  | 'profile:manage'
  | 'doctors:browse'
  | 'appointments:book'
  | 'appointments:view-own'
  | 'medical-info:view-own'
  | 'notifications:view-own'
  | 'appointments:view-assigned'
  | 'schedule:manage-own'
  | 'doctors:view-availability'
  | 'patients:manage'
  | 'appointments:manage'
  | 'users:manage'
  | 'doctors:manage'
  | 'departments:manage'
  | 'reports:view'
  | 'settings:manage'

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  patient: [
    'dashboard:patient',
    'doctors:browse',
    'appointments:book',
    'appointments:view-own',
    'medical-info:view-own',
    'notifications:view-own',
    'profile:manage',
  ],
  doctor: ['dashboard:doctor', 'appointments:view-assigned', 'schedule:manage-own', 'profile:manage'],
  receptionist: ['dashboard:reception', 'patients:manage', 'appointments:manage', 'doctors:view-availability', 'profile:manage'],
  admin: [
    'dashboard:admin',
    'users:manage',
    'doctors:manage',
    'departments:manage',
    'patients:manage',
    'appointments:manage',
    'reports:view',
    'settings:manage',
  ],
}

/** The URL area each role's portal lives under. */
export const ROLE_PORTAL: Record<UserRole, string> = {
  patient: ROUTES.patient.root,
  doctor: ROUTES.doctor.root,
  receptionist: ROUTES.receptionist.root,
  admin: ROUTES.admin.root,
}

type Subject = UserRole | Pick<AuthUser, 'role'> | null | undefined

const roleOf = (subject: Subject) => (typeof subject === 'string' ? subject : subject?.role)

export function hasPermission(subject: Subject, permission: Permission): boolean {
  const role = roleOf(subject)
  return !!role && ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyPermission(subject: Subject, permissions: readonly Permission[]): boolean {
  return permissions.some((permission) => hasPermission(subject, permission))
}

export function hasRole(subject: Subject, roles: readonly UserRole[]): boolean {
  const role = roleOf(subject)
  return !!role && roles.includes(role)
}

export interface AccessRule {
  /** Any of these roles may enter. */
  roles?: readonly UserRole[]
  /** The user's role must grant this permission. */
  permission?: Permission
}

/** True when the user satisfies every part of the rule. An empty rule only requires sign-in. */
export function canAccess(subject: Subject, { roles, permission }: AccessRule): boolean {
  if (!roleOf(subject)) return false
  if (roles && !hasRole(subject, roles)) return false
  if (permission && !hasPermission(subject, permission)) return false
  return true
}

/**
 * The permission each protected page requires. The router guards pages with these
 * rules, and the login page uses them to decide whether a remembered "return to"
 * URL is safe to send the signed-in user to.
 */
export const ROUTE_PERMISSIONS: ReadonlyArray<readonly [pattern: string, permission: Permission]> = [
  [ROUTES.patient.dashboard, 'dashboard:patient'],
  [ROUTES.patient.doctors, 'doctors:browse'],
  [ROUTES.patient.book, 'appointments:book'],
  [ROUTES.patient.appointments, 'appointments:view-own'],
  [ROUTES.patient.medical, 'medical-info:view-own'],
  [ROUTES.patient.notifications, 'notifications:view-own'],
  [ROUTES.patient.profile, 'profile:manage'],
  [ROUTES.patient.settings, 'profile:manage'],
  [ROUTES.doctor.dashboard, 'dashboard:doctor'],
  [ROUTES.doctor.appointments, 'appointments:view-assigned'],
  [ROUTES.doctor.appointmentDetails(':appointmentId'), 'appointments:view-assigned'],
  [ROUTES.doctor.schedule, 'schedule:manage-own'],
  [ROUTES.doctor.profile, 'profile:manage'],
  [ROUTES.receptionist.dashboard, 'dashboard:reception'],
  [ROUTES.receptionist.patients, 'patients:manage'],
  [ROUTES.receptionist.appointments, 'appointments:manage'],
  [ROUTES.receptionist.doctors, 'doctors:view-availability'],
  [ROUTES.receptionist.profile, 'profile:manage'],
  [ROUTES.admin.dashboard, 'dashboard:admin'],
  [ROUTES.admin.users, 'users:manage'],
  [ROUTES.admin.doctors, 'doctors:manage'],
  [ROUTES.admin.departments, 'departments:manage'],
  [ROUTES.admin.patients, 'patients:manage'],
  [ROUTES.admin.appointments, 'appointments:manage'],
  [ROUTES.admin.reports, 'reports:view'],
  [ROUTES.admin.settings, 'settings:manage'],
  [ROUTES.admin.uiKit, 'settings:manage'],
]

/** Whether a role may open a URL: it must be inside the role's portal and pass that page's permission. */
export function canAccessPath(subject: Subject, path: string): boolean {
  const role = roleOf(subject)
  if (!role) return false
  const pathname = path.split(/[?#]/)[0]
  const portal = ROLE_PORTAL[role]
  if (pathname !== portal && !pathname.startsWith(`${portal}/`)) return false
  const rule = ROUTE_PERMISSIONS.find(([pattern]) => matchPath(pattern, pathname))
  return rule ? hasPermission(role, rule[1]) : pathname === portal
}

/** Where to send a user after sign-in: the page they were heading to if allowed, otherwise their dashboard. */
export function getPostLoginPath(subject: Pick<AuthUser, 'role'>, from?: string | null): string {
  return from && canAccessPath(subject, from) ? from : ROLE_HOME[subject.role]
}
