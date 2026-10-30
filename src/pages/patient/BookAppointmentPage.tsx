import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { addDays } from 'date-fns'
import {
  AlertCircle,
  BadgeDollarSign,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { TimeSlotPicker } from '@/components/common/TimeSlotPicker'
import { DayStrip, DoctorAvatar, NextAvailable } from '@/components/doctors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { useDepartments } from '@/hooks/useDepartments'
import { useAvailableSlots, useDoctorAvailability, useDoctors } from '@/hooks/useDoctors'
import { usePatientByUserId } from '@/hooks/usePatients'
import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { formatCurrency } from '@/lib/format'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { appointmentService } from '@/services'
import type { Appointment } from '@/types'

const BOOKING_WINDOW_DAYS = 14
const ALL = 'all'
const REASON_MIN = 5
const REASON_MAX = 500

/**
 * Patient booking flow: department → doctor → day and time → reason → confirm.
 * Any step can be pre-filled from the URL (`departmentId`, `doctorId`, `date`, `time`),
 * which is how the public site's "Book" buttons hand over the patient's choice.
 */
export function BookAppointmentPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { data: patient, isLoading: patientLoading } = usePatientByUserId(user?.id)
  const { data: departments } = useDepartments('active')
  const { data: doctors, isLoading: doctorsLoading } = useDoctors({ status: 'active' })
  const { data: availability } = useDoctorAvailability(doctors?.map((d) => d.id), BOOKING_WINDOW_DAYS)

  const dates = useMemo(() => Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => toDateKey(addDays(new Date(), i))), [])

  const doctorId = params.get('doctorId') ?? undefined
  const doctor = doctors?.find((d) => d.id === doctorId)
  const departmentId = doctor?.departmentId ?? params.get('departmentId') ?? ALL
  const date = params.get('date') && dates.includes(params.get('date')!) ? params.get('date')! : undefined
  const time = params.get('time') ?? undefined

  const [reason, setReason] = useState('')
  const [reasonTouched, setReasonTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [booked, setBooked] = useState<Appointment | null>(null)

  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots(doctor?.id, date)
  const selectedSlot = slots.find((s) => s.startTime === time)

  /** Updates the URL-held selection. Changing an earlier step clears the later ones. */
  const update = (patch: Partial<Record<'departmentId' | 'doctorId' | 'date' | 'time', string | undefined>>) => {
    setSubmitError(null)
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        const order = ['departmentId', 'doctorId', 'date', 'time'] as const
        const firstChanged = order.findIndex((key) => key in patch)
        order.forEach((key, index) => {
          if (key in patch) {
            const value = patch[key]
            if (value && value !== ALL) next.set(key, value)
            else next.delete(key)
          } else if (firstChanged !== -1 && index > firstChanged) {
            next.delete(key)
          }
        })
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  // Once a doctor is known, start on their first day with an opening.
  useEffect(() => {
    if (doctor && !date && availability?.[doctor.id]) {
      const first = availability[doctor.id].next?.date ?? dates[0]
      update({ date: first, time })
    }
    // `update` is recreated each render, so only the inputs it reads are dependencies.
  }, [doctor?.id, date, availability])

  // A pre-filled time that has been taken (or never existed) is dropped with a notice.
  // After booking, the slot is taken by this patient's own request, so that is skipped.
  const staleTime = !booked && !!time && !!date && !slotsLoading && slots.length > 0 && !selectedSlot?.available
  useEffect(() => {
    if (staleTime) {
      toast.warning('That time is no longer available', 'Please choose another slot.')
      update({ time: undefined })
    }
  }, [staleTime])

  const departmentDoctors = (doctors ?? [])
    .filter((d) => departmentId === ALL || d.departmentId === departmentId)
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
  const department = departments?.find((d) => d.id === departmentId)

  const reasonError =
    reason.trim().length < REASON_MIN
      ? `Please describe the reason for your visit (at least ${REASON_MIN} characters).`
      : reason.length > REASON_MAX
        ? `Please keep it under ${REASON_MAX} characters.`
        : null
  const ready = !!patient && !!doctor && !!date && !!selectedSlot?.available && !reasonError

  const submit = async () => {
    setReasonTouched(true)
    if (!ready || !patient || !doctor || !date || !time) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const appointment = await appointmentService.create({ patientId: patient.id, doctorId: doctor.id, appointmentDate: date, startTime: time, reason })
      setBooked(appointment)
      toast.success('Appointment requested', `${appointment.appointmentNumber} · we'll confirm it shortly.`)
      window.scrollTo({ top: 0 })
    } catch (error) {
      setSubmitError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (patientLoading || doctorsLoading) return <LoadingState variant="page" label="Loading booking…" />
  if (!patient) {
    return (
      <Card>
        <EmptyState
          icon={UserX}
          title="Patient profile not found"
          description="Your account isn't linked to a patient record, so appointments can't be booked from it."
          className="py-16"
        />
      </Card>
    )
  }

  if (booked && doctor) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Appointment requested</h1>
          <p className="mt-2 text-muted-foreground">
            Your request has been sent to {doctor.fullName}. The front desk will confirm it shortly and you'll get a notification.
          </p>
          <dl className="mt-6 space-y-2 rounded-lg border bg-muted/40 p-4 text-left text-sm">
            <SummaryRow label="Reference" value={booked.appointmentNumber} />
            <SummaryRow label="Doctor" value={doctor.fullName} />
            <SummaryRow label="Date" value={formatDate(booked.appointmentDate, 'EEEE, MMMM d, yyyy')} />
            <SummaryRow label="Time" value={`${formatTime(booked.startTime)} – ${formatTime(booked.endTime)}`} />
            <SummaryRow label="Status" value="Pending confirmation" />
          </dl>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to={ROUTES.patient.dashboard}>Go to my dashboard</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBooked(null)
                setReason('')
                setReasonTouched(false)
                setParams(new URLSearchParams(), { replace: true })
              }}
            >
              Book another appointment
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Book an appointment" description="Choose a specialist and a time that suits you. We'll confirm your request shortly." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Step 1 — doctor */}
          <Step number={1} title="Choose a doctor" done={!!doctor}>
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="book-department">Department</Label>
              <Select value={departmentId} onValueChange={(value) => update({ departmentId: value, doctorId: undefined })}>
                <SelectTrigger id="book-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All departments</SelectItem>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {doctorId && !doctor && (
              <p className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4" /> That doctor isn't taking appointments right now. Please choose another.
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Doctors">
              {departmentDoctors.map((d) => {
                const selected = d.id === doctor?.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update({ departmentId: d.departmentId, doctorId: d.id })}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40 hover:bg-accent/40',
                    )}
                  >
                    <DoctorAvatar doctor={d} className="h-11 w-11" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{d.fullName}</span>
                      <span className="block truncate text-sm text-muted-foreground">{d.specialization}</span>
                      <NextAvailable availability={availability?.[d.id]} className="mt-1" />
                    </span>
                    <span className="shrink-0 text-sm font-medium">{formatCurrency(d.consultationFee)}</span>
                  </button>
                )
              })}
            </div>
            {!departmentDoctors.length && (
              <EmptyState icon={Stethoscope} title="No doctors available" description="No doctors in this department are taking appointments." className="py-8" />
            )}
          </Step>

          {/* Step 2 — date and time */}
          <Step number={2} title="Pick a day and time" done={!!selectedSlot?.available} disabled={!doctor}>
            {doctor ? (
              <>
                <DayStrip dates={dates} value={date} onChange={(d) => update({ date: d })} freeByDate={availability?.[doctor.id]?.freeByDate} />
                <div className="mt-4">
                  {date ? (
                    <TimeSlotPicker
                      slots={slots}
                      value={time}
                      loading={slotsLoading}
                      onChange={(t) => update({ time: t })}
                      emptyMessage={`${doctor.fullName} doesn't see patients on ${formatDate(date, 'EEEE, MMM d')}. Try another day.`}
                    />
                  ) : (
                    <Skeleton className="h-40 rounded-lg" />
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Choose a doctor first to see their availability.</p>
            )}
          </Step>

          {/* Step 3 — reason */}
          <Step number={3} title="Reason for your visit" done={!reasonError} disabled={!selectedSlot?.available}>
            <Label htmlFor="book-reason" className="sr-only">
              Reason for your visit
            </Label>
            <Textarea
              id="book-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setReasonTouched(true)}
              rows={4}
              maxLength={REASON_MAX + 50}
              placeholder="e.g. Follow-up on blood pressure medication, occasional chest tightness when climbing stairs."
              aria-invalid={reasonTouched && !!reasonError}
              aria-describedby="book-reason-help"
            />
            <div id="book-reason-help" className="mt-1.5 flex justify-between gap-4 text-xs">
              <span className={reasonTouched && reasonError ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                {reasonTouched && reasonError ? reasonError : 'This helps your doctor prepare. Please don’t include anything you consider sensitive.'}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {reason.length}/{REASON_MAX}
              </span>
            </div>
          </Step>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold">Booking summary</h2>
            {doctor ? (
              <div className="mt-4 flex items-center gap-3">
                <DoctorAvatar doctor={doctor} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{doctor.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">{department?.name ?? doctor.specialization}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No doctor selected yet.</p>
            )}
            <dl className="mt-4 space-y-2.5 border-t pt-4 text-sm">
              <SummaryRow icon={CalendarDays} label="Date" value={date ? formatDate(date, 'EEE, MMM d, yyyy') : '—'} />
              <SummaryRow
                icon={Clock}
                label="Time"
                value={selectedSlot?.available ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` : '—'}
              />
              <SummaryRow icon={BadgeDollarSign} label="Consultation fee" value={doctor ? formatCurrency(doctor.consultationFee) : '—'} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">The fee is paid at the hospital. You can cancel free of charge.</p>
            {submitError && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
              </p>
            )}
            <Button className="mt-4 w-full" size="lg" onClick={submit} disabled={submitting || !doctor || !selectedSlot?.available}>
              {submitting ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
              Request appointment
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Step({ number, title, done, disabled, children }: { number: number; title: string; done: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <Card className={cn('p-5 sm:p-6', disabled && 'opacity-60')}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            done ? 'bg-secondary text-white' : 'bg-primary/10 text-primary',
          )}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : number}
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  )
}

function SummaryRow({ icon: Icon, label, value }: { icon?: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
