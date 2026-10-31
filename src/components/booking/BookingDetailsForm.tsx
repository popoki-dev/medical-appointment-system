import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BOOKING_CONFIG } from '@/config/booking'
import { bookingDetailsSchema, type BookingDetailsFormValues } from '@/lib/validation'

interface BookingDetailsFormProps {
  id: string
  patientName: string
  patientNumber: string
  defaultValues: BookingDetailsFormValues
  onSubmit: (values: BookingDetailsFormValues) => void
}

/**
 * Step 5: reason, optional notes and contact details. Name and patient number come
 * from the signed-in account; phone and email are pre-filled but can be changed for
 * this visit. Submitted by the wizard's Continue button through the form `id`.
 */
export function BookingDetailsForm({ id, patientName, patientNumber, defaultValues, onSubmit }: BookingDetailsFormProps) {
  const form = useForm<BookingDetailsFormValues>({ resolver: zodResolver(bookingDetailsSchema), defaultValues })
  const reason = useWatch({ control: form.control, name: 'reason' }) ?? ''

  return (
    <form id={id} noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold">Patient</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnly id="booking-patient-name" label="Full name" value={patientName} />
          <ReadOnly id="booking-patient-number" label="Patient number" value={patientNumber} />
          <FormField control={form.control} name="phone" label="Phone" required
            render={({ field, inputProps }) => <Input type="tel" autoComplete="tel" {...field} {...inputProps} />} />
          <FormField control={form.control} name="email" label="Email" required
            render={({ field, inputProps }) => <Input type="email" autoComplete="email" {...field} {...inputProps} />} />
        </div>
        <p className="text-xs text-muted-foreground">We'll use these to contact you about this appointment. Your profile isn't changed.</p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold">Visit</legend>
        <FormField
          control={form.control}
          name="reason"
          label="Reason for visit"
          required
          description={`${reason.trim().length}/${BOOKING_CONFIG.reasonMaxLength} characters`}
          render={({ field, inputProps }) => (
            <Textarea rows={3} placeholder="e.g. Follow-up on blood pressure medication" maxLength={BOOKING_CONFIG.reasonMaxLength + 50} {...field} {...inputProps} />
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          label="Additional notes"
          description="Optional. Anything the doctor should know beforehand."
          render={({ field, inputProps }) => <Textarea rows={3} {...field} {...inputProps} />}
        />
      </fieldset>
    </form>
  )
}

function ReadOnly({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} readOnly disabled />
    </div>
  )
}
