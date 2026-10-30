import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CalendarClock, CalendarPlus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { usePatientByUserId } from '@/hooks/usePatients'
import { formatDate, formatTime, toDateKey } from '@/lib/date'

export function PatientDashboardPage() {
  const { user } = useAuth()
  const { data: patient } = usePatientByUserId(user?.id)
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(
    { patientId: patient?.id },
    { enabled: !!patient },
  )
  const isLoading = appointmentsLoading || patient === undefined

  const today = toDateKey(new Date())
  const { upcoming, completed, missed } = useMemo(
    () => ({
      upcoming: appointments.filter((a) => a.appointmentDate >= today && (a.status === 'pending' || a.status === 'confirmed')),
      completed: appointments.filter((a) => a.status === 'completed'),
      missed: appointments.filter((a) => ['cancelled', 'rejected', 'no-show'].includes(a.status)),
    }),
    [appointments, today],
  )
  const next = upcoming[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.fullName.split(' ')[0]}`}
        description={patient ? `Patient no. ${patient.patientNumber}` : "Here's an overview of your care."}
        actions={
          <Button asChild>
            <Link to={ROUTES.patient.book}>
              <CalendarPlus /> Book appointment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Upcoming" value={upcoming.length} icon={CalendarClock} loading={isLoading} description="Pending or confirmed" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle2} tone="teal" loading={isLoading} description="Past visits" />
        <StatCard title="Cancelled / missed" value={missed.length} icon={XCircle} tone="rose" loading={isLoading} description="All time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Next appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-4">
                  <p className="text-sm font-medium text-accent-foreground">{formatDate(next.appointmentDate, 'EEEE, MMM d')}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular-nums">
                    <Clock className="h-5 w-5 text-primary" /> {formatTime(next.startTime)}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{next.doctorName}</p>
                  <p className="text-muted-foreground">
                    {next.departmentName} · {next.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                <CalendarCheck className="mb-2 h-8 w-8 text-primary/60" />
                No upcoming appointments.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-3 lg:col-span-2">
          <h2 className="text-base font-semibold">Upcoming appointments</h2>
          <DataTable
            columns={appointmentColumns(['doctor', 'department', 'date', 'time', 'status'])}
            data={upcoming}
            getRowId={(a) => a.id}
            loading={isLoading}
            pageSize={5}
            emptyTitle="Nothing scheduled"
            emptyDescription="Book a visit with one of our specialists."
            emptyAction={
              <Button asChild size="sm">
                <Link to={ROUTES.patient.book}>Book appointment</Link>
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
