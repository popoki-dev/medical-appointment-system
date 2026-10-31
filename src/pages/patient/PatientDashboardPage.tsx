import { useMemo, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Ban,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Eye,
  Hash,
  Stethoscope,
  UserPen,
  XCircle,
} from 'lucide-react'
import { AppointmentDoctor } from '@/components/appointments/AppointmentDoctor'
import { patientAppointmentColumns } from '@/components/appointments/patientAppointmentColumns'
import { usePatientAppointmentActions } from '@/components/appointments/usePatientAppointmentActions'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/routes'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useCurrentPatient } from '@/hooks/usePatients'
import { formatDate, formatRelative, formatTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { canPatientCancel, isUpcoming } from '@/services'
import type { AppointmentDetails } from '@/types'

const RECENT_LIMIT = 5
const NOTIFICATION_LIMIT = 5

const QUICK_ACTIONS = [
  { title: 'Book Appointment', description: 'Pick a doctor and time', href: ROUTES.bookAppointment, icon: CalendarPlus },
  { title: 'Browse Doctors', description: 'Specialists and availability', href: ROUTES.patient.doctors, icon: Stethoscope },
  { title: 'View All Appointments', description: 'History and upcoming visits', href: ROUTES.patient.appointments, icon: CalendarDays },
  { title: 'Edit Profile', description: 'Contact and personal details', href: ROUTES.patient.profile, icon: UserPen },
]

/** Most recent first: by visit date and time. */
const latestFirst = (a: AppointmentDetails, b: AppointmentDetails) =>
  `${b.appointmentDate}${b.startTime}`.localeCompare(`${a.appointmentDate}${a.startTime}`)

export function PatientDashboardPage() {
  const { user } = useAuth()
  const { data: patient } = useCurrentPatient()
  // Every query is scoped to the signed-in patient's own records.
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(
    { patientId: patient?.id },
    { enabled: !!patient },
  )
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(user?.id)
  const { viewDetails, requestCancel, dialogs } = usePatientAppointmentActions(patient?.id)
  const isLoading = patient === undefined || (!!patient && appointmentsLoading)

  const { upcoming, completed, cancelled, recent } = useMemo(() => {
    const now = new Date()
    return {
      upcoming: appointments.filter((a) => isUpcoming(a, now)), // already sorted soonest first
      completed: appointments.filter((a) => a.status === 'completed'),
      cancelled: appointments.filter((a) => a.status === 'cancelled'),
      recent: [...appointments].sort(latestFirst).slice(0, RECENT_LIMIT),
    }
  }, [appointments])
  const next = upcoming[0]
  const appointmentNotifications = notifications.filter((n) => n.type === 'appointment' || n.type === 'reminder').slice(0, NOTIFICATION_LIMIT)

  const recentColumns = useMemo(() => patientAppointmentColumns(viewDetails, requestCancel), [viewDetails, requestCancel])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName.split(' ')[0] ?? ''}`}
        description={
          patient ? (
            <>
              Patient ID <span className="font-mono font-medium text-foreground">{patient.patientNumber}</span> · Here's an overview of your care.
            </>
          ) : (
            "Here's an overview of your care."
          )
        }
        actions={
          <Button asChild>
            <Link to={ROUTES.bookAppointment}>
              <CalendarPlus /> Book appointment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Upcoming" value={upcoming.length} icon={CalendarClock} loading={isLoading} description="Pending or confirmed" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle2} tone="teal" loading={isLoading} description="Past visits" />
        <StatCard title="Cancelled" value={cancelled.length} icon={XCircle} tone="rose" loading={isLoading} description="All time" />
        <StatCard
          title="Next appointment"
          value={next ? formatDate(next.appointmentDate, 'EEE, MMM d') : 'None'}
          icon={CalendarCheck}
          tone="amber"
          loading={isLoading}
          description={next ? `${formatTime(next.startTime)} · ${next.doctorName}` : 'Nothing scheduled yet'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <UpcomingAppointmentCard
            appointment={next}
            moreCount={Math.max(upcoming.length - 1, 0)}
            loading={isLoading}
            onView={viewDetails}
            onCancel={requestCancel}
          />
        </div>

        <div className="min-w-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <QuickAction key={action.href} {...action} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Recent appointments</h2>
          <Button variant="link" size="sm" asChild className="px-0">
            <Link to={ROUTES.patient.appointments}>
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
        <DataTable
          columns={recentColumns}
          data={recent}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={RECENT_LIMIT}
          emptyTitle="No appointments yet"
          emptyDescription="Your bookings will appear here."
          emptyAction={
            <Button asChild size="sm">
              <Link to={ROUTES.bookAppointment}>Book appointment</Link>
            </Button>
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Notifications</CardTitle>
            <Button variant="link" size="sm" asChild className="h-auto px-0">
              <Link to={ROUTES.patient.notifications}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : appointmentNotifications.length ? (
              <ul className="space-y-4">
                {appointmentNotifications.map((n) => (
                  <li key={n.id} className="flex gap-3">
                    <span
                      className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-muted-foreground/30' : 'bg-primary')}
                      aria-label={n.isRead ? undefined : 'Unread'}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{formatRelative(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Bell} title="No notifications" description="Appointment updates will show up here." className="py-6" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>My profile</CardTitle>
            <Button variant="link" size="sm" asChild className="h-auto px-0">
              <Link to={ROUTES.patient.profile}>Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {patient === undefined ? (
              <Skeleton className="h-40" />
            ) : (
              <dl className="space-y-3 text-sm">
                <ProfileRow label="Full name" value={user?.fullName} />
                <ProfileRow label="Patient number" value={patient?.patientNumber} mono />
                <ProfileRow label="Email" value={user?.email} />
                <ProfileRow label="Phone" value={user?.phone} />
                <ProfileRow label="Date of birth" value={patient ? formatDate(patient.dateOfBirth) : undefined} />
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {dialogs}
    </div>
  )
}

interface UpcomingAppointmentCardProps {
  appointment: AppointmentDetails | undefined
  moreCount: number
  loading: boolean
  onView: (appointment: AppointmentDetails) => void
  onCancel: (appointment: AppointmentDetails) => void
}

function UpcomingAppointmentCard({ appointment, moreCount, loading, onView, onCancel }: UpcomingAppointmentCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Upcoming appointment</CardTitle>
        {moreCount > 0 && (
          <Button variant="link" size="sm" asChild className="h-auto px-0">
            <Link to={`${ROUTES.patient.appointments}?tab=upcoming`}>+{moreCount} more upcoming</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-36" />
        ) : appointment ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <AppointmentDoctor
                appointment={appointment}
                size="lg"
                subtitle={[appointment.doctor?.specialization, appointment.departmentName].filter(Boolean).join(' · ')}
              />
              <StatusBadge status={appointment.status} />
            </div>
            <div className="grid gap-3 rounded-lg bg-accent/60 p-4 sm:grid-cols-3">
              <Fact icon={CalendarDays} label="Date" value={formatDate(appointment.appointmentDate, 'EEEE, MMM d')} />
              <Fact icon={Clock} label="Time" value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`} />
              <Fact icon={Hash} label="Appointment no." value={appointment.appointmentNumber} mono />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => onView(appointment)}>
                <Eye /> View details
              </Button>
              {canPatientCancel(appointment) && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onCancel(appointment)}
                >
                  <Ban /> Cancel appointment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming appointments"
            description="Book a visit with one of our specialists."
            action={
              <Button asChild size="sm">
                <Link to={ROUTES.bookAppointment}>Book appointment</Link>
              </Button>
            }
            className="py-6"
          />
        )}
      </CardContent>
    </Card>
  )
}

function Fact({ icon: Icon, label, value, mono }: { icon: ComponentType<{ className?: string }>; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-accent-foreground/80">{label}</p>
        <p className={cn('text-sm font-semibold', mono && 'font-mono')}>{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ title, description, href, icon: Icon }: (typeof QUICK_ACTIONS)[number]) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-medium leading-tight">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </Link>
  )
}

function ProfileRow({ label, value, mono }: { label: string; value: string | undefined; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn('min-w-0 truncate text-right font-medium', mono && 'font-mono')}>{value ?? '—'}</dd>
    </div>
  )
}
