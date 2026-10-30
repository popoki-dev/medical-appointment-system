import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROLE_HOME, ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  roles: UserRole[]
  children: ReactNode
}

/** Redirects anonymous users to login and users of other roles to their own portal. */
export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  if (!roles.includes(user.role)) return <Navigate to={ROUTES.unauthorized} replace state={{ home: ROLE_HOME[user.role] }} />
  return <>{children}</>
}

/** For login/register: signed-in users go straight to their dashboard. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <>{children}</>
}
