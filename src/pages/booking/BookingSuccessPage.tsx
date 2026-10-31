import { Link, useParams } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Clock, Home, ListChecks, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DoctorAvatar } from '@/components/doctors'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { useAppointment } from '@/hooks/useAppointments'
import { useCurrentPatient } from '@/hooks/usePatients'
import { formatDate, formatTime } from '@/lib/date'
import { formatCurrency } from '@/lib/format'

/** Shown after a booking. Reads the appointment live, so a later status change shows here too. */
export function BookingSuccessPage() {
  const { appointmentId } = useParams()
  const { data: patient } = useCurrentPatient()
  const { data: appointment, isLoading, error } = useAppointment(appointmentId)

  if (isLoading || patient === undefined) return <LoadingState variant="page" label="Loading your booking…" />
  // Only the patient who booked may see it.
  if (error || !appointment || !patient || appointment.patientId !== patient.id) {
    return (
      <Card>
        <EmptyState
          icon={SearchX}
          title="Booking not found"
          description="We couldn't find this booking on your account."
          action={
            <Button asChild>
              <Link to={ROUTES.patient.appointments}>Go to My Appointments</Link>
            </Button>
          }
          className="py-16"
        />
      </Card>
    )
  }

  const { doctor } = appointment
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Your appointment is booked</h1>
        <p className="mt-1 text-muted-foreground">
          We've sent your request to the hospital. You'll be notified as soon as it's confirmed.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-accent/60 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-accent-foreground/80">Appointment number</p>
            <p className="font-mono text-2xl font-semibold tracking-wide" data-testid="appointment-number">
              {appointment.appointmentNumber}
            </p>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="flex items-center gap-4">
            {doctor && <DoctorAvatar doctor={doctor} />}
            <div className="min-w-0">
              <p className="text-lg font-semibold">{appointment.doctorName}</p>
              <p className="text-sm text-muted-foreground">
                {[doctor?.specialization, appointment.departmentName].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <Item icon={CalendarDays} label="Date" value={formatDate(appointment.appointmentDate, 'EEEE, MMMM d, yyyy')} />
            <Item icon={Clock} label="Time" value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`} />
          </dl>

          {doctor && (
            <p className="text-sm text-muted-foreground">
              Consultation fee <span className="font-medium text-foreground">{formatCurrency(doctor.consultationFee)}</span>, payable at the
              hospital. Please arrive 15 minutes early to check in.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link to={ROUTES.patient.appointments}>
            <ListChecks /> Go to My Appointments
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.home}>
            <Home /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

function Item({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  )
}
