import { isValid, parseISO } from 'date-fns'
import { z } from 'zod'
import { BOOKING_CONFIG } from '@/config/booking'
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

const fullNameSchema = requiredString('Full name')
  .min(3, 'Enter your full name')
  .max(80, 'Name must be 80 characters or fewer')
  .regex(/^[\p{L}\s.'-]+$/u, 'Name can only contain letters, spaces, hyphens and apostrophes')

const dateOfBirthSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((v) => isValidDateKey(v) && v >= MIN_BIRTH_DATE, 'Enter a valid date of birth')
  .refine((v) => v <= toDateKey(new Date()), 'Date of birth cannot be in the future')

const genderSchema = z.enum(['male', 'female', 'other'], {
  required_error: 'Gender is required',
  invalid_type_error: 'Gender is required',
})

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    dateOfBirth: dateOfBirthSchema,
    gender: genderSchema,
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

/** The emergency contact is optional, but once started it needs all three fields. */
const emergencyContactSchema = z
  .object({
    name: z.string().trim().max(80, 'Name must be 80 characters or fewer'),
    relationship: z.string().trim().max(40, 'Relationship must be 40 characters or fewer'),
    phone: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (!v.name && !v.relationship && !v.phone) return
    if (!v.name) ctx.addIssue({ code: 'custom', path: ['name'], message: 'Contact name is required' })
    if (!v.relationship) ctx.addIssue({ code: 'custom', path: ['relationship'], message: 'Relationship is required' })
    if (!phoneSchema.safeParse(v.phone).success) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Enter a valid phone number' })
  })

export const patientProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  address: z.string().trim().max(200, 'Address must be 200 characters or fewer'),
  emergencyContact: emergencyContactSchema,
})
export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, mismatch)
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/** Step 5 of the booking wizard. The service re-validates with the same schema. */
export const bookingDetailsSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Please tell us the reason for your visit')
    .min(BOOKING_CONFIG.reasonMinLength, `Please give a little more detail (at least ${BOOKING_CONFIG.reasonMinLength} characters)`)
    .max(BOOKING_CONFIG.reasonMaxLength, `Please keep it under ${BOOKING_CONFIG.reasonMaxLength} characters`),
  notes: z.string().trim().max(BOOKING_CONFIG.notesMaxLength, `Please keep notes under ${BOOKING_CONFIG.notesMaxLength} characters`),
  phone: phoneSchema,
  email: emailSchema,
})
export type BookingDetailsFormValues = z.infer<typeof bookingDetailsSchema>
