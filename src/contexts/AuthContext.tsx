import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storageKey } from '@/lib/storage'
import { authService, SESSION_KEY, storageService, type PatientSignUpInput } from '@/services'
import type { AuthUser, LoginCredentials } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  registerPatient: (input: PatientSignUpInput) => Promise<AuthUser>
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

  // Signing in or out in another tab applies here too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === storageKey(SESSION_KEY)) setUser(authService.getCurrentUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const signedIn = await authService.login(credentials)
    setUser(signedIn)
    return signedIn
  }, [])

  const registerPatient = useCallback(async (input: PatientSignUpInput) => {
    const signedIn = await authService.registerPatient(input)
    setUser(signedIn)
    return signedIn
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, registerPatient, logout }),
    [user, login, registerPatient, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
