import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, Loader2, ShieldCheck, Stethoscope, User } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ROLE_HOME, ROLE_LABEL, ROUTES } from '@/config/routes'
import { DEMO_PASSWORD } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'
import { loginSchema, type LoginFormValues } from '@/lib/validation'
import type { AuthUser, UserRole } from '@/types'
import { AuthCard } from './AuthCard'

const ROLE_ICONS: Record<UserRole, typeof User> = {
  patient: User,
  doctor: Stethoscope,
  receptionist: ClipboardList,
  admin: ShieldCheck,
}

export function LoginPage() {
  const { login, loginAsRole } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [demoPending, setDemoPending] = useState<UserRole | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSuccess = (user: AuthUser) => {
    toast.success(`Welcome back, ${user.fullName.split(' ')[0]}`)
    // Only honour the redirect if it belongs to the signed-in role's area.
    const home = ROLE_HOME[user.role]
    const target = from && from.startsWith(`/${user.role}`) ? from : home
    navigate(target, { replace: true })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      onSuccess(await login(values))
    } catch (error) {
      form.setError('root', { message: (error as Error).message })
    }
  })

  const signInAs = async (role: UserRole) => {
    setDemoPending(role)
    try {
      onSuccess(await loginAsRole(role))
    } catch (error) {
      toast.error('Could not sign in', (error as Error).message)
    } finally {
      setDemoPending(null)
    }
  }

  return (
    <AuthCard
      title="Sign in to MediBook"
      description="Access your appointments and records."
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
            <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} {...inputProps} />
          )}
        />
        {form.formState.errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">or explore a demo</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ROLE_ICONS) as UserRole[]).map((role) => {
          const Icon = ROLE_ICONS[role]
          return (
            <Button key={role} variant="outline" onClick={() => signInAs(role)} disabled={demoPending !== null} className="justify-start">
              {demoPending === role ? <Loader2 className="animate-spin" /> : <Icon className="text-primary" />}
              {ROLE_LABEL[role]}
            </Button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo emails: <span className="font-medium">patient@ / doctor@ / reception@ / admin@medibook.example</span> · password{' '}
        <span className="font-medium">{DEMO_PASSWORD}</span>
      </p>
    </AuthCard>
  )
}
