import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/config/routes'
import { toast } from '@/lib/toast'
import { registerSchema, type RegisterFormValues } from '@/lib/validation'
import { AuthCard } from './AuthCard'

export function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  // Account creation is part of the patient module; the form and validation are ready for it.
  const onSubmit = form.handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400))
    toast.info('Registration is coming soon', 'For now, sign in with the demo patient account.')
  })

  return (
    <AuthCard
      title="Create your account"
      description="Book and manage appointments online."
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="firstName" label="First name" required
            render={({ field, inputProps }) => <Input autoComplete="given-name" {...field} {...inputProps} />} />
          <FormField control={form.control} name="lastName" label="Last name" required
            render={({ field, inputProps }) => <Input autoComplete="family-name" {...field} {...inputProps} />} />
        </div>
        <FormField control={form.control} name="email" label="Email" required
          render={({ field, inputProps }) => <Input type="email" autoComplete="email" {...field} {...inputProps} />} />
        <FormField control={form.control} name="phone" label="Phone" required
          render={({ field, inputProps }) => <Input type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" {...field} {...inputProps} />} />
        <FormField control={form.control} name="password" label="Password" required description="At least 6 characters."
          render={({ field, inputProps }) => <Input type="password" autoComplete="new-password" {...field} {...inputProps} />} />
        <FormField control={form.control} name="confirmPassword" label="Confirm password" required
          render={({ field, inputProps }) => <Input type="password" autoComplete="new-password" {...field} {...inputProps} />} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
