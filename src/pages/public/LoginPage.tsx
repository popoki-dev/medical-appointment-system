import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ClipboardList, Loader2, LogIn, ShieldCheck, Stethoscope, User } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_LABEL, ROUTES } from '@/config/routes'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import { getPostLoginPath } from '@/lib/permissions'
import { toast } from '@/lib/toast'
import { loginSchema, type LoginFormValues } from '@/lib/validation'
import type { AuthUser, UserRole } from '@/types'
import { AuthCard } from './AuthCard'

const DEMO_ROLES: { role: UserRole; icon: typeof User }[] = [
  { role: 'admin', icon: ShieldCheck },
  { role: 'receptionist', icon: ClipboardList },
  { role: 'doctor', icon: Stethoscope },
  { role: 'patient', icon: User },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [demoPending, setDemoPending] = useState<UserRole | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })
  const busy = form.formState.isSubmitting || demoPending !== null

  const onSuccess = (user: AuthUser) => {
    toast.success(`Welcome back, ${user.fullName.replace(/^Dr\.\s+/, '').split(' ')[0]}`)
    navigate(getPostLoginPath(user, from), { replace: true })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      onSuccess(await login(values))
    } catch (error) {
      form.setError('root', { message: (error as Error).message })
    }
  })

  const signInAs = async (role: UserRole) => {
    const credentials = { email: DEMO_ACCOUNTS[role], password: DEMO_PASSWORD }
    form.clearErrors()
    form.setValue('email', credentials.email)
    form.setValue('password', credentials.password)
    setDemoPending(role)
    try {
      onSuccess(await login(credentials))
    } catch (error) {
      form.setError('root', { message: (error as Error).message })
    } finally {
      setDemoPending(null)
    }
  }

  return (
    <AuthCard
      title="Sign in to your account"
      description="Manage appointments, schedules and patient care."
      footer={
        <>
          New patient?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
            Create an account
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
        <FormField
          control={form.control}
          name="email"
          label="Email"
          render={({ field, inputProps }) => (
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} {...inputProps} />
          )}
        />
        <FormField
          control={form.control}
          name="password"
          label="Password"
          render={({ field, inputProps }) => (
            <PasswordInput autoComplete="current-password" placeholder="Enter your password" {...field} {...inputProps} />
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field, inputProps }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={inputProps.id}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
                <Label htmlFor={inputProps.id} className="font-normal text-muted-foreground">
                  Remember me
                </Label>
              </div>
            )}
          />
          <Link to={ROUTES.forgotPassword} className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>
      </form>

      <section className="mt-6 rounded-xl border bg-muted/40 p-4" aria-labelledby="demo-accounts-heading">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 id="demo-accounts-heading" className="text-sm font-semibold">
            Demo accounts
          </h2>
          <p className="text-xs text-muted-foreground">
            Password <code className="rounded bg-card px-1.5 py-0.5 font-mono text-foreground">{DEMO_PASSWORD}</code>
          </p>
        </div>
        <ul className="space-y-1.5">
          {DEMO_ROLES.map(({ role, icon: Icon }) => (
            <li key={role}>
              <button
                type="button"
                onClick={() => signInAs(role)}
                disabled={busy}
                className="flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {demoPending === role ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-tight">{ROLE_LABEL[role]}</span>
                  <span className="block truncate text-xs text-muted-foreground">{DEMO_ACCOUNTS[role]}</span>
                </span>
                <span className="text-xs font-medium text-primary">Sign in</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo only — accounts and passwords are stored in this browser, not on a server.
        </p>
      </section>
    </AuthCard>
  )
}
