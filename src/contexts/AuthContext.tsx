import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService, storageService } from '@/services'
import type { AuthUser, LoginCredentials, UserRole } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  loginAsRole: (role: UserRole) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser())

  // The session stores only a user id; re-read the user whenever user records change
  // so name/photo edits, deactivation or a data reset are reflected straight away.
  useEffect(
    () =>
      storageService.subscribe((changed) => {
        if (changed.includes('users')) setUser(authService.getCurrentUser())
      }),
    [],
  )

  const login = useCallback(async (credentials: LoginCredentials) => {
    const signedIn = await authService.login(credentials)
    setUser(signedIn)
    return signedIn
  }, [])

  const loginAsRole = useCallback(async (role: UserRole) => {
    const signedIn = await authService.loginAsRole(role)
    setUser(signedIn)
    return signedIn
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, loginAsRole, logout }),
    [user, login, loginAsRole, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
