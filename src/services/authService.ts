import { DEMO_ACCOUNTS } from '@/data/mockData'
import { storage } from '@/lib/storage'
import type { AuthSession, AuthUser, LoginCredentials, User, UserRole } from '@/types'
import { caseInsensitive, delay, ServiceError } from './repository'
import { storageService } from './storageService'
import { toAuthUser } from './userService'

const SESSION_KEY = 'session'
const SESSION_HOURS = 8

function startSession(user: User): AuthUser {
  if (user.status !== 'active') throw new ServiceError('This account is not active. Please contact the hospital.', 'UNAUTHORIZED')
  storage.set<AuthSession>(SESSION_KEY, {
    userId: user.id,
    token: `mock.${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString(),
  })
  return toAuthUser(user)
}

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthUser> {
    await delay()
    const user = storageService.getAll('users').find((u) => caseInsensitive(u.email) === caseInsensitive(email))
    if (!user || user.password !== password) throw new ServiceError('Invalid email or password', 'UNAUTHORIZED')
    return startSession(user)
  },

  /** Signs in as the seeded demo account for a role. */
  async loginAsRole(role: UserRole): Promise<AuthUser> {
    await delay()
    const users = storageService.getAll('users')
    const user = users.find((u) => u.email === DEMO_ACCOUNTS[role]) ?? users.find((u) => u.role === role && u.status === 'active')
    if (!user) throw new ServiceError(`No ${role} account available`, 'NOT_FOUND')
    return startSession(user)
  },

  async logout(): Promise<void> {
    await delay(150)
    storage.remove(SESSION_KEY)
  },

  /** The signed-in user, read fresh from the data store (so profile edits show up immediately). */
  getCurrentUser(): AuthUser | null {
    const session = storage.get<AuthSession | null>(SESSION_KEY, null)
    if (!session?.userId || new Date(session.expiresAt) < new Date()) {
      if (session) storage.remove(SESSION_KEY)
      return null
    }
    const user = storageService.getById('users', session.userId)
    if (!user || user.status !== 'active') return null
    return toAuthUser(user)
  },
}
