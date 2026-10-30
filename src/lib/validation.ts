import { isValid, parseISO } from 'date-fns'
import { z } from 'zod'
import { toDateKey } from './date'

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address')

/** Rules for choosing a new password (registration and reset). */
export const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v: string) => /[A-Z]/.test(v), label: 'An uppercase letter' },
  { test: (v: string) => /[a-z]/.test(v), label: 'A lowercase letter' },
  { test: (v: string) => /\d/.test(v), label: 'A number' },
] as const

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/\d/, 'Password must include a number')

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number')

export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`)

const passwordsMatch = <T extends { password: string; confirmPassword: string }>(v: T) => v.password === v.confirmPassword
const mismatch = { message: 'Passwords do not match', path: ['confirmPassword'] }

export const loginSchema = z.object({
  email: emailSchema,
  // Sign-in only checks presence; the strength rules apply when a password is chosen.
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})
export type LoginFormValues = z.infer<typeof loginSchema>

const MIN_BIRTH_DATE = '1900-01-01'
const isValidDateKey = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && isValid(parseISO(v))

export const registerSchema = z
  .object({
    fullName: requiredString('Full name')
      .min(3, 'Enter your full name')
      .max(80, 'Name must be 80 characters or fewer')
      .regex(/^[\p{L}\s.'-]+$/u, 'Name can only contain letters, spaces, hyphens and apostrophes'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((v) => isValidDateKey(v) && v >= MIN_BIRTH_DATE, 'Enter a valid date of birth')
      .refine((v) => v <= toDateKey(new Date()), 'Date of birth cannot be in the future'),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Gender is required',
      invalid_type_error: 'Gender is required',
    }),
  })
  .refine(passwordsMatch, mismatch)
export type RegisterFormValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(passwordsMatch, mismatch)
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
