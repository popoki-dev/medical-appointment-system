import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarCheck, Loader2, UserX } from 'lucide-react'
import {
  BOOKING_STEPS,
  BookingCalendar,
  BookingDetailsForm,
  BookingStepper,
  BookingSummary,
  DepartmentSelect,
  DoctorSelect,
  type BookingStep,
} from '@/components/booking'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { TimeSlotPicker } from '@/components/common/TimeSlotPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKING_CONFIG } from '@/config/booking'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { useDepartments } from '@/hooks/useDepartments'
import { useAvailableSlots, useDoctorAvailability, useDoctors, useDoctorSchedules } from '@/hooks/useDoctors'
import { useCurrentPatient } from '@/hooks/usePatients'
import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { toast } from '@/lib/toast'
import type { BookingDetailsFormValues } from '@/lib/validation'
import { appointmentService, computeSlots, lastBookableDate, ServiceError } from '@/services'

const DETAILS_FORM_ID = 'booking-details'

interface Selection {
  departmentId?: string
  doctorId?: string
  date?: string
  time?: string
}

/**
 * The booking wizard: department → doctor → date → time → details → confirm.
 * It can be pre-filled from the URL (`departmentId`, `doctorId`, `date`, `time`), which is
 * how "Book" buttons elsewhere hand over a choice; anything no longer valid is dropped.
 * Availability is read live, so a slot taken meanwhile is flagged before confirming,
 * and the service checks everything again when the booking is submitted.
 */
export function BookAppointmentPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const { data: patient } = useCurrentPatient()
  const { data: departments } = useDepartments('active')
  const { data: activeDoctors } = useDoctors({ status: 'active' })
  const lastDate = useMemo(() => lastBookableDate(), [])

  const [step, setStep] = useState<BookingStep>(0)
  const [selection, setSelection] = useState<Selection>({})
  const [details, setDetails] = useState<BookingDetailsFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [submitError, setSubmitError] = useState<{ message: string; conflict: boolean } | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  // Only doctors in a department that is open for bookings.
  const doctors = useMemo(() => {
    if (!activeDoctors || !departments) return undefined
    const open = new Set(departments.map((d) => d.id))
    return activeDoctors.filter((d) => open.has(d.departmentId)).sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [activeDoctors, departments])
  const doctorCounts = useMemo(
    () => (doctors ?? []).reduce<Record<string, number>>((counts, d) => ({ ...counts, [d.departmentId]: (counts[d.departmentId] ?? 0) + 1 }), {}),
    [doctors],
  )
  const departmentDoctors = useMemo(
    () => (selection.departmentId && doctors ? doctors.filter((d) => d.departmentId === selection.departmentId) : undefined),
    [doctors, selection.departmentId],
  )
  const { data: availability } = useDoctorAvailability(departmentDoctors?.map((d) => d.id), BOOKING_CONFIG.horizonDays)

  const department = departments?.find((d) => d.id === selection.departmentId)
  const doctor = departmentDoctors?.find((d) => d.id === selection.doctorId)
  const doctorAvailability = doctor ? availability?.[doctor.id] : undefined
  const { data: schedules = [] } = useDoctorSchedules(doctor?.id)
  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots(doctor?.id, selection.date)
  const slot = slots.find((s) => s.startTime === selection.time)
  const slotTaken = !!selection.time && !slotsLoading && !slot?.available

  /** Changing a step's choice clears every later choice that depended on it. */
  const choose = (patch: Selection) => {
    setSubmitError(null)
    setSelection((current) => {
      if ('departmentId' in patch) return { departmentId: patch.departmentId }
      if ('doctorId' in patch) return { departmentId: current.departmentId, doctorId: patch.doctorId }
      if ('date' in patch) return { ...current, date: patch.date, time: undefined }
      return { ...current, ...patch }
    })
  }

  // Pre-fill once from the URL, keeping only choices that are still bookable.
  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !doctors || !departments) return
    prefilled.current = true
    const wanted = {
      doctorId: params.get('doctorId'),
      departmentId: params.get('departmentId'),
      date: params.get('date'),
      time: params.get('time'),
    }
    const pickedDoctor = doctors.find((d) => d.id === wanted.doctorId)
    const departmentId = pickedDoctor?.departmentId ?? (departments.some((d) => d.id === wanted.departmentId) ? wanted.departmentId! : undefined)
    const today = toDateKey(new Date())
    const daySlots = pickedDoctor && wanted.date && wanted.date >= today && wanted.date <= lastDate ? computeSlots(pickedDoctor.id, wanted.date) : []
    const date = daySlots.some((s) => s.available) ? wanted.date! : undefined
    const time = date && daySlots.find((s) => s.startTime === wanted.time)?.available ? wanted.time! : undefined

    const dropped = (wanted.doctorId && !pickedDoctor) || (wanted.date && !date) || (wanted.time && !time)
    if (dropped) toast.warning('Some of your choices are no longer available', 'Please pick again from what is open.')
    setSelection({ departmentId, doctorId: pickedDoctor?.id, date, time })
    setStep(time ? 4 : date ? 3 : pickedDoctor ? 2 : departmentId ? 1 : 0)
  }, [doctors, departments])

  // While the patient is still choosing, drop a date or time that has just filled up.
  const dateFull = !!selection.date && !!doctorAvailability && (doctorAvailability.freeByDate[selection.date] ?? 0) === 0
  useEffect(() => {
    if (step <= 2 && dateFull) {
      toast.warning('That day has just filled up', 'Please pick another date.')
      setSelection((s) => ({ ...s, date: undefined, time: undefined }))
    }
  }, [step, dateFull])
  useEffect(() => {
    if (step === 3 && slotTaken) {
      toast.warning(`${formatTime(selection.time!)} has just been booked`, 'Please pick another time.')
      setSelection((s) => ({ ...s, time: undefined }))
    }
  }, [step, slotTaken])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const reachable: BookingStep = details && slot ? 5 : selection.time ? 4 : selection.date ? 3 : selection.doctorId ? 2 : selection.departmentId ? 1 : 0
  const canContinue = [!!department, !!doctor, !!selection.date, !!slot?.available, true, false][step]
  const goTo = (next: BookingStep) => {
    setSubmitError(null)
    setStep(next)
  }
  const pickAnotherTime = () => {
    setSelection((s) => ({ ...s, time: undefined }))
    goTo(3)
  }

  const confirm = async () => {
    if (submittingRef.current || !patient || !doctor || !selection.date || !selection.time || !details) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      const appointment = await appointmentService.create({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: selection.date,
        startTime: selection.time,
        reason: details.reason,
        notes: details.notes,
        contact: { phone: details.phone, email: details.email },
      })
      toast.success('Appointment booked', `${appointment.appointmentNumber} is pending confirmation.`)
      navigate(ROUTES.bookingSuccess(appointment.id), { replace: true })
    } catch (error) {
      const message = (error as Error).message
      if (error instanceof ServiceError && error.field) {
        toast.error('Please check your details', message)
        goTo(4)
      } else {
        setSubmitError({ message, conflict: error instanceof ServiceError && error.code === 'CONFLICT' })
      }
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (patient === undefined || !doctors) return <LoadingState variant="page" label="Loading booking…" />
  if (!patient || !user) {
    return (
      <Card>
        <EmptyState icon={UserX} title="No patient profile" description="This account has no patient profile, so it can't book appointments." className="py-16" />
      </Card>
    )
  }

  const heading = [
    { title: 'Choose a department', description: 'Select the specialty you would like to see.' },
    { title: 'Choose a doctor', description: `Doctors in ${department?.name ?? 'this department'} who are taking bookings.` },
    { title: 'Pick a date', description: `Days with openings for ${doctor?.fullName ?? 'the doctor'} are marked. You can book up to ${BOOKING_CONFIG.horizonDays} days ahead.` },
    { title: 'Pick a time', description: selection.date ? `Open slots on ${formatDate(selection.date, 'EEEE, MMMM d')}. Times are local hospital time.` : '' },
    { title: 'Your details', description: 'Tell us why you are coming in and how to reach you.' },
    { title: 'Review and confirm', description: 'Check everything below, then confirm your booking.' },
  ][step]

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-6">
      <PageHeader title="Book an appointment" description="Six quick steps. Consultation fees are paid at the hospital." />

      <Card className="p-4 sm:p-5">
        <BookingStepper current={step} reachable={reachable} onSelect={goTo} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="min-w-0">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Step {step + 1} of {BOOKING_STEPS.length}
            </p>
            <CardTitle className="text-xl">{heading.title}</CardTitle>
            {heading.description && <p className="text-sm text-muted-foreground">{heading.description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            {step >= 4 && slotTaken && (
              <Alert>
                The {formatTime(selection.time!)} slot was just taken by someone else.{' '}
                <button type="button" onClick={pickAnotherTime} className="font-medium underline">
                  Choose another time
                </button>
              </Alert>
            )}

            {step === 0 && (
              <DepartmentSelect
                departments={departments}
                doctorCounts={doctorCounts}
                value={selection.departmentId}
                onChange={(departmentId) => choose({ departmentId })}
              />
            )}
            {step === 1 && (
              <DoctorSelect doctors={departmentDoctors} availability={availability} value={selection.doctorId} onChange={(doctorId) => choose({ doctorId })} />
            )}
            {step === 2 &&
              (doctorAvailability ? (
                <BookingCalendar
                  value={selection.date}
                  onChange={(date) => choose({ date })}
                  freeByDate={doctorAvailability.freeByDate}
                  schedules={schedules}
                  lastDate={lastDate}
                />
              ) : (
                <Skeleton className="h-80 rounded-xl" />
              ))}
            {step === 3 && (
              <div className="space-y-4">
                <TimeSlotPicker
                  slots={slots}
                  value={selection.time}
                  onChange={(time) => choose({ time })}
                  loading={slotsLoading}
                  emptyMessage="The doctor has no slots on this day. Please go back and choose another date."
                />
                {slots.length > 0 && (
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-5 rounded border bg-card" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-5 rounded border border-dashed bg-muted/50" /> Booked or passed
                    </span>
                    <span>
                      {slots.filter((s) => s.available).length} of {slots.length} slots free · {slotLength(slots[0])} each
                    </span>
                  </p>
                )}
              </div>
            )}
            {step === 4 && (
              <BookingDetailsForm
                id={DETAILS_FORM_ID}
                patientName={user.fullName}
                patientNumber={patient.patientNumber}
                defaultValues={details ?? { reason: '', notes: '', phone: user.phone, email: user.email }}
                onSubmit={(values) => {
                  setDetails(values)
                  goTo(5)
                }}
              />
            )}
            {step === 5 && (
              <div className="space-y-5">
                <div className="rounded-xl border bg-muted/30 p-5">
                  <BookingSummary
                    variant="full"
                    data={{ patientName: user.fullName, department, doctor, date: selection.date, slot, reason: details?.reason }}
                  />
                </div>
                {details && (
                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">Contact</dt>
                      <dd className="font-medium">
                        {details.phone}
                        <span className="block font-normal text-muted-foreground">{details.email}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Additional notes</dt>
                      <dd className="font-medium">{details.notes || <span className="font-normal text-muted-foreground">None</span>}</dd>
                    </div>
                  </dl>
                )}
                <p className="text-xs text-muted-foreground">
                  Your request will be <span className="font-medium text-foreground">pending</span> until the hospital confirms it. You'll
                  get a notification either way, and you can cancel from My Appointments.
                </p>
                {submitError && (
                  <Alert>
                    {submitError.message}{' '}
                    {submitError.conflict && (
                      <button type="button" onClick={pickAnotherTime} className="font-medium underline">
                        Choose another time
                      </button>
                    )}
                  </Alert>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => goTo((step - 1) as BookingStep)} disabled={step === 0 || submitting}>
                <ArrowLeft /> Back
              </Button>
              {step < 4 && (
                <Button onClick={() => goTo((step + 1) as BookingStep)} disabled={!canContinue}>
                  Continue <ArrowRight />
                </Button>
              )}
              {step === 4 && (
                <Button type="submit" form={DETAILS_FORM_ID}>
                  Review booking <ArrowRight />
                </Button>
              )}
              {step === 5 && (
                <Button onClick={confirm} disabled={submitting || slotTaken || !slot}>
                  {submitting ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
                  {submitting ? 'Booking…' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Your booking</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingSummary data={{ department, doctor, date: selection.date, slot: slot ?? undefined }} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

const slotLength = ({ startTime, endTime }: { startTime: string; endTime: string }) => {
  const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  return `${minutes(endTime) - minutes(startTime)} min`
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
