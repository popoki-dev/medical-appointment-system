import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROLE_HOME, ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { canAccess, getPostLoginPath, type AccessRule } from '@/lib/permissions'
import { toast } from '@/lib/toast'

interface ProtectedRouteProps extends AccessRule {
  children: ReactNode
}

/**
 * Guards a route. Anonymous users go to login (and come back afterwards);
 * signed-in users without access go to their own dashboard.
 *
 * @example
 * <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
 * <ProtectedRoute permission="reports:view"><ReportsPage /></ProtectedRoute>
 */
export function ProtectedRoute({ roles, permission, children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  if (!canAccess(user, { roles, permission })) return <AccessDenied home={ROLE_HOME[user.role]} />
  return <>{children}</>
}

function AccessDenied({ home }: { home: string }) {
  useEffect(() => {
    // Deferred so the toaster has mounted on a fresh page load. Not cancelled on unmount,
    // since the redirect unmounts this at once; the fixed id stops StrictMode's double
    // effect from showing it twice.
    window.setTimeout(() =>
      toast.warning("You don't have access to that page", "We've taken you to your dashboard.", 'access-denied'),
    )
  }, [])
  return <Navigate to={home} replace />
}

/** For login, registration and password reset: signed-in users go straight to their dashboard. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const from = (useLocation().state as { from?: string } | null)?.from
  if (user) return <Navigate to={getPostLoginPath(user, from)} replace />
  return <>{children}</>
}
