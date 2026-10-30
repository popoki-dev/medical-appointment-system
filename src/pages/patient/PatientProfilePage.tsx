import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, Save } from 'lucide-react'
import { FormField } from '@/components/common/FormField'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GENDER_OPTIONS } from '@/config/status'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentPatient } from '@/hooks/usePatients'
import { formatDate, toDateKey } from '@/lib/date'
import { toast } from '@/lib/toast'
import { getInitials } from '@/lib/utils'
import { patientProfileSchema, type PatientProfileFormValues } from '@/lib/validation'
import { patientService } from '@/services'
import type { AuthUser, Patient } from '@/types'

const NO_CONTACT = { name: '', relationship: '', phone: '' }
const EMPTY: PatientProfileFormValues = {
  fullName: '',
  phone: '',
  dateOfBirth: '',
  gender: 'other',
  address: '',
  emergencyContact: NO_CONTACT,
}

const toFormValues = (user: AuthUser, patient: Patient): PatientProfileFormValues => ({
  fullName: user.fullName,
  phone: user.phone,
  dateOfBirth: patient.dateOfBirth,
  gender: patient.gender,
  address: patient.address,
  emergencyContact: patient.emergencyContact ?? NO_CONTACT,
})

export function PatientProfilePage() {
  const { user } = useAuth()
  const { data: patient, isLoading } = useCurrentPatient()
  const form = useForm<PatientProfileFormValues>({ resolver: zodResolver(patientProfileSchema), defaultValues: EMPTY })
  const { isDirty, isSubmitting, errors } = form.formState

  // Load the saved details once they arrive; don't clobber edits in progress on later refreshes.
  useEffect(() => {
    if (user && patient && !form.formState.isDirty) form.reset(toFormValues(user, patient))
  }, [user, patient, form])

  if (isLoading || patient === undefined || !user) return <LoadingState variant="page" label="Loading your profile…" />
  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" />
        <Card className="p-6 text-sm text-muted-foreground">No patient profile is linked to this account.</Card>
      </div>
    )
  }

  const onSubmit = form.handleSubmit(async ({ emergencyContact, ...values }) => {
    try {
      const contact = emergencyContact.name || emergencyContact.relationship || emergencyContact.phone ? emergencyContact : null
      await patientService.updateProfile(patient.id, { ...values, emergencyContact: contact })
      form.reset({ ...values, emergencyContact: contact ?? NO_CONTACT })
      toast.success('Profile updated', 'Your details have been saved.')
    } catch (error) {
      form.setError('root', { message: (error as Error).message })
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Keep your contact and personal details up to date." />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            {user.profileImage && <AvatarImage src={user.profileImage} alt="" />}
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-lg font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">
              Patient no. <span className="font-mono">{patient.patientNumber}</span> · Member since {formatDate(user.createdAt, 'MMMM yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {errors.root && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errors.root.message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="fullName" label="Full name" required
              render={({ field, inputProps }) => <Input autoComplete="name" {...field} {...inputProps} />} />
            <div className="space-y-2">
              <label htmlFor="profile-email" className="text-sm font-medium leading-none">Email</label>
              <Input id="profile-email" value={user.email} readOnly disabled aria-describedby="profile-email-help" />
              <p id="profile-email-help" className="text-xs text-muted-foreground">Your sign-in email. Ask reception to change it.</p>
            </div>
            <FormField control={form.control} name="phone" label="Phone" required
              render={({ field, inputProps }) => <Input type="tel" autoComplete="tel" {...field} {...inputProps} />} />
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
            <FormField control={form.control} name="address" label="Address" className="sm:col-span-2"
              render={({ field, inputProps }) => <Textarea rows={2} autoComplete="street-address" {...field} {...inputProps} />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency contact</CardTitle>
            <CardDescription>Optional. Someone we can call if we can't reach you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField control={form.control} name="emergencyContact.name" label="Name"
              render={({ field, inputProps }) => <Input {...field} {...inputProps} />} />
            <FormField control={form.control} name="emergencyContact.relationship" label="Relationship"
              render={({ field, inputProps }) => <Input placeholder="e.g. Spouse" {...field} {...inputProps} />} />
            <FormField control={form.control} name="emergencyContact.phone" label="Phone"
              render={({ field, inputProps }) => <Input type="tel" {...field} {...inputProps} />} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => form.reset(toFormValues(user, patient))}>
            Discard changes
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
