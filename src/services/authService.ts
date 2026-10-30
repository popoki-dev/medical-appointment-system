import { DEMO_PASSWORD, mockUsers } from '@/data'
import { storage } from '@/lib/storage'
import type { AuthSession, LoginCredentials, User, UserRole } from '@/types'
import { delay, ServiceError } from './mockClient'

const SESSION_KEY = 'session'

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthSession> {
    await delay()
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user || password !== DEMO_PASSWORD) {
      throw new ServiceError('Invalid email or password', 'UNAUTHORIZED')
    }
    return this.createSession(user)
  },

  /** Signs in as the demo account for a given role. Handy for exploring the app. */
  async loginAsRole(role: UserRole): Promise<AuthSession> {
    await delay()
    const user = mockUsers.find((u) => u.role === role)
    if (!user) throw new ServiceError(`No demo user for role ${role}`, 'NOT_FOUND')
    return this.createSession(user)
  },

  async logout(): Promise<void> {
    await delay(150)
    storage.remove(SESSION_KEY)
  },

  getSession(): AuthSession | null {
    const session = storage.get<AuthSession | null>(SESSION_KEY, null)
    if (!session) return null
    if (new Date(session.expiresAt) < new Date()) {
      storage.remove(SESSION_KEY)
      return null
    }
    return session
  },

  createSession(user: User): AuthSession {
    const session: AuthSession = {
      user,
      token: `mock.${btoa(user.id)}.${Date.now()}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    }
    storage.set(SESSION_KEY, session)
    return session
  },
}
