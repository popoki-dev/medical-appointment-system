export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  fullName: string
  email: string
  /** Demo-only credential stored in plain text. Never do this with a real backend. */
  password: string
  phone: string
  role: UserRole
  profileImage: string | null
  status: UserStatus
  createdAt: string
}

/** A user as exposed to the UI — credentials stripped. */
export type AuthUser = Omit<User, 'password'>

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}
