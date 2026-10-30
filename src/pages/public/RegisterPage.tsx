import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Loader2, UserPlus } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { toDateKey } from '@/lib/date'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { PASSWORD_RULES, registerSchema, type RegisterFormValues } from '@/lib/validation'
import { ServiceError } from '@/services'
import { AuthCard } from './AuthCard'

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
] as const

export function RegisterPage() {
  const { registerPatient } = useAuth()
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', dateOfBirth: '' },
  })
  const password = useWatch({ control: form.control, name: 'password' })

  const onSubmit = form.handleSubmit(async ({ confirmPassword: _confirm, ...values }) => {
    try {
      const user = await registerPatient(values)
      toast.success(`Welcome to MediBook, ${user.fullName.split(' ')[0]}`, 'Your patient account is ready.')
      navigate(ROUTES.patient.dashboard, { replace: true })
    } catch (error) {
      if (error instanceof ServiceError && error.code === 'CONFLICT') {
        form.setError('email', { message: 'An account with this email already exists. Try signing in instead.' }, { shouldFocus: true })
      } else {
        form.setError('root', { message: (error as Error).message })
      }
    }
  })

  return (
    <AuthCard
      title="Create your patient account"
      description="Register to book and manage your appointments online."
      className="max-w-lg"
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {form.formState.errors.root && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField control={form.control} name="fullName" label="Full name" required
          render={({ field, inputProps }) => <Input autoComplete="name" placeholder="Jane Doe" {...field} {...inputProps} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="email" label="Email" required
            render={({ field, inputProps }) => <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} {...inputProps} />} />
          <FormField control={form.control} name="phone" label="Phone" required
            render={({ field, inputProps }) => <Input type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" {...field} {...inputProps} />} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="dateOfBirth" label="Date of birth" required
            render={({ field, inputProps }) => (
              <Input type="date" autoComplete="bday" min="1900-01-01" max={toDateKey(new Date())} {...field} {...inputProps} />
            )} />
          <FormField control={form.control} name="gender" label="Gender" required
            render={({ field, inputProps }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger {...inputProps} ref={field.ref} onBlur={field.onBlur}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
        </div>
        <FormField control={form.control} name="password" label="Password" required
          render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password ?? '')
            return (
              <li key={rule.label} className={cn('flex items-center gap-1.5', met ? 'text-emerald-700' : 'text-muted-foreground')}>
                <Check className={cn('h-3.5 w-3.5', !met && 'opacity-30')} aria-hidden />
                {rule.label}
                <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
              </li>
            )
          })}
        </ul>
        <FormField control={form.control} name="confirmPassword" label="Confirm password" required
          render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          This is a demo. Your details are saved only in this browser.
        </p>
      </form>
    </AuthCard>
  )
}
