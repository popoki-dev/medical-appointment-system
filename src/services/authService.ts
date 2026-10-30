import { storage } from '@/lib/storage'
import type { AuthSession, AuthUser, Gender, LoginCredentials, User } from '@/types'
import { notificationService } from './notificationService'
import { patientService } from './patientService'
import { caseInsensitive, delay, ServiceError } from './repository'
import { storageService } from './storageService'
import { toAuthUser, userService } from './userService'

export const SESSION_KEY = 'session'
const SESSION_HOURS = 8
const RESET_KEY = 'password-reset'
const RESET_MINUTES = 15
const RESET_MAX_ATTEMPTS = 5

/** A pending mock password reset. Real systems would email the code and keep it server-side. */
interface PasswordResetRequest {
  userId: string
  email: string
  code: string
  expiresAt: string
  attempts: number
}

export interface PatientSignUpInput {
  fullName: string
  email: string
  phone: string
  password: string
  dateOfBirth: string // "yyyy-MM-dd"
  gender: Gender
}

const findByEmail = (email: string) =>
  storageService.getAll('users').find((u) => caseInsensitive(u.email) === caseInsensitive(email.trim()))

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
    const user = findByEmail(email)
    if (!user || user.password !== password) throw new ServiceError('Incorrect email or password.', 'UNAUTHORIZED')
    return startSession(user)
  },

  /** Creates a patient account and profile, then signs the new patient in. */
  async registerPatient({ fullName, email, phone, password, dateOfBirth, gender }: PatientSignUpInput): Promise<AuthUser> {
    const patient = await patientService.register({
      fullName: fullName.trim(),
      email,
      phone: phone.trim(),
      password,
      dateOfBirth,
      gender,
      // Completed later from the patient's profile settings.
      bloodGroup: null,
      address: '',
      emergencyContact: null,
    })
    return startSession(storageService.getById('users', patient.userId)!)
  },

  /**
   * Starts a mock password reset and returns the 6-digit code. The UI shows the code
   * because there is no email service; a real app would send it and return nothing.
   */
  async requestPasswordReset(email: string): Promise<{ code: string; expiresAt: string }> {
    await delay()
    const user = findByEmail(email)
    if (!user) throw new ServiceError('No account found with that email address.', 'NOT_FOUND')
    if (user.status !== 'active') throw new ServiceError('This account is not active. Please contact the hospital.', 'UNAUTHORIZED')
    const request: PasswordResetRequest = {
      userId: user.id,
      email: user.email,
      code: String(Math.floor(100000 + Math.random() * 900000)),
      expiresAt: new Date(Date.now() + RESET_MINUTES * 60 * 1000).toISOString(),
      attempts: 0,
    }
    storage.set(RESET_KEY, request)
    return { code: request.code, expiresAt: request.expiresAt }
  },

  /** Completes a reset started with `requestPasswordReset`. Does not sign the user in. */
  async resetPassword({ email, code, password }: { email: string; code: string; password: string }): Promise<void> {
    await delay()
    const request = storage.get<PasswordResetRequest | null>(RESET_KEY, null)
    if (!request || caseInsensitive(request.email) !== caseInsensitive(email.trim())) {
      throw new ServiceError('This reset request was not found. Please request a new code.', 'NOT_FOUND')
    }
    if (new Date(request.expiresAt) < new Date()) {
      storage.remove(RESET_KEY)
      throw new ServiceError('This code has expired. Please request a new one.', 'VALIDATION')
    }
    if (request.code !== code.trim()) {
      const attempts = request.attempts + 1
      if (attempts >= RESET_MAX_ATTEMPTS) {
        storage.remove(RESET_KEY)
        throw new ServiceError('Too many incorrect attempts. Please request a new code.', 'VALIDATION')
      }
      storage.set(RESET_KEY, { ...request, attempts })
      throw new ServiceError('That code is incorrect.', 'VALIDATION', 'code')
    }
    await userService.update(request.userId, { password })
    storage.remove(RESET_KEY)
  },

  /** Changes a signed-in user's password after checking their current one. */
  async changePassword(userId: string, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    await delay()
    const user = storageService.getById('users', userId)
    if (!user) throw new ServiceError('Account not found', 'NOT_FOUND')
    if (user.password !== currentPassword) throw new ServiceError('Your current password is incorrect.', 'VALIDATION', 'currentPassword')
    if (newPassword === currentPassword) {
      throw new ServiceError('Choose a password different from your current one.', 'VALIDATION', 'newPassword')
    }
    await userService.update(userId, { password: newPassword })
    notificationService.notify({
      userId,
      title: 'Password changed',
      message: 'Your account password was changed. If this wasn’t you, reset it from the sign-in page.',
      type: 'system',
    })
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
