import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import type { LoginCredentials, User, UserRole } from '@/types'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  loginAsRole: (role: UserRole) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSession()?.user ?? null)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials)
    setUser(session.user)
    return session.user
  }, [])

  const loginAsRole = useCallback(async (role: UserRole) => {
    const session = await authService.loginAsRole(role)
    setUser(session.user)
    return session.user
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
