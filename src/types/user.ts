export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}
