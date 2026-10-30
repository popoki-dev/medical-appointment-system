import { z } from 'zod'

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email address')

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number')

export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`)

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: requiredString('First name'),
    lastName: requiredString('Last name'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>
