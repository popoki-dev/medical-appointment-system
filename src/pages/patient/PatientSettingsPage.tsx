import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, KeyRound, Loader2, LogOut } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { PasswordInput } from '@/components/common/PasswordInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { changePasswordSchema, PASSWORD_RULES, type ChangePasswordFormValues } from '@/lib/validation'
import { authService, ServiceError } from '@/services'

export function PatientSettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control: form.control, name: 'newPassword' })
  const { isSubmitting, errors } = form.formState

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    if (!user) return
    try {
      await authService.changePassword(user.id, { currentPassword, newPassword })
      form.reset()
      toast.success('Password changed', 'Use your new password next time you sign in.')
    } catch (error) {
      if (error instanceof ServiceError && (error.field === 'currentPassword' || error.field === 'newPassword')) {
        form.setError(error.field, { message: error.message }, { shouldFocus: true })
      } else {
        form.setError('root', { message: (error as Error).message })
      }
    }
  })

  const signOut = async () => {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your password and session." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" /> Change password
            </CardTitle>
            <CardDescription>Choose a strong password you don't use anywhere else.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
              {errors.root && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errors.root.message}
                </div>
              )}
              <FormField control={form.control} name="currentPassword" label="Current password" required
                render={({ field, inputProps }) => <PasswordInput autoComplete="current-password" {...field} {...inputProps} />} />
              <FormField control={form.control} name="newPassword" label="New password" required
                render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(newPassword ?? '')
                  return (
                    <li key={rule.label} className={cn('flex items-center gap-1.5', met ? 'text-emerald-700' : 'text-muted-foreground')}>
                      <Check className={cn('h-3.5 w-3.5', !met && 'opacity-30')} aria-hidden />
                      {rule.label}
                      <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
                    </li>
                  )
                })}
              </ul>
              <FormField control={form.control} name="confirmPassword" label="Confirm new password" required
                render={({ field, inputProps }) => <PasswordInput autoComplete="new-password" {...field} {...inputProps} />} />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />}
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Signed in as <span className="font-medium text-foreground">{user?.email}</span>. Sessions end automatically after 8 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
