import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Info, KeyRound, Loader2, Mail } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/config/routes'
import { toast } from '@/lib/toast'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from '@/lib/validation'
import { authService, ServiceError } from '@/services'
import { AuthCard } from './AuthCard'

type Step = { name: 'request' } | { name: 'reset'; email: string; code: string; expiresAt: string } | { name: 'done' }

const backToLogin = (
  <Link to={ROUTES.login} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
    <ArrowLeft className="h-4 w-4" />
    Back to sign in
  </Link>
)

function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

/** Mock password reset: request a code, enter it with a new password, then sign in. */
export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>({ name: 'request' })

  if (step.name === 'done') return <ResetComplete />
  if (step.name === 'reset') {
    return <ResetStep {...step} onRestart={() => setStep({ name: 'request' })} onDone={() => setStep({ name: 'done' })} />
  }
  return <RequestStep onSent={(email, { code, expiresAt }) => setStep({ name: 'reset', email, code, expiresAt })} />
}

function RequestStep({ onSent }: { onSent: (email: string, reset: { code: string; expiresAt: string }) => void }) {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      onSent(email, await authService.requestPasswordReset(email))
    } catch (error) {
      form.setError('root', { message: (error as Error).message })
    }
  })

  return (
    <AuthCard title="Forgot your password?" description="Enter your account email and we'll send you a reset code." footer={backToLogin}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={form.formState.errors.root?.message} />
        <FormField control={form.control} name="email" label="Email" required
          render={({ field, inputProps }) => <Input type="email" autoComplete="email" placeholder="you@example.com" autoFocus {...field} {...inputProps} />} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Mail />}
          Send reset code
        </Button>
      </form>
    </AuthCard>
  )
}

interface ResetStepProps {
  email: string
  code: string
  expiresAt: string
  onRestart: () => void
  onDone: () => void
}

function ResetStep({ email, code, expiresAt, onRestart, onDone }: ResetStepProps) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async ({ code: entered, password }) => {
    try {
      await authService.resetPassword({ email, code: entered, password })
      onDone()
    } catch (error) {
      const { message } = error as Error
      if (error instanceof ServiceError && error.field === 'code') form.setError('code', { message }, { shouldFocus: true })
      else form.setError('root', { message })
    }
  })

  return (
    <AuthCard
      title="Reset your password"
      description={
        <>
          Enter the code sent to <span className="font-medium text-foreground">{email}</span> and choose a new password.
        </>
      }
      footer={backToLogin}
    >
      <div className="mb-4 flex gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-medium">Demo mode:</span> no email is sent. Your code is{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono font-semibold tracking-widest">{code}</code>. It expires at{' '}
          {format(new Date(expiresAt), 'h:mm a')}.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError message={form.formState.errors.root?.message} />
        <FormField control={form.control} name="code" label="Reset code" required
          render={({ field, inputProps }) => (
            <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" className="font-mono tracking-widest" autoFocus {...field} {...inputProps} />
          )} />
        <FormField control={form.control} name="password" label="New password" required
          description="At least 8 characters with an uppercase letter, a lowercase letter and a number."
          render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
        <FormField control={form.control} name="confirmPassword" label="Confirm new password" required
          render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />}
          Reset password
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn't get a code?{' '}
          <button type="button" onClick={onRestart} className="font-medium text-primary hover:underline">
            Start again
          </button>
        </p>
      </form>
    </AuthCard>
  )
}

function ResetComplete() {
  const navigate = useNavigate()
  return (
    <AuthCard title="Password updated" description="You can now sign in with your new password.">
      <div className="flex flex-col items-center gap-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <Button
          className="w-full"
          onClick={() => {
            toast.success('Password updated', 'Sign in with your new password.')
            navigate(ROUTES.login, { replace: true })
          }}
        >
          Continue to sign in
        </Button>
      </div>
    </AuthCard>
  )
}
