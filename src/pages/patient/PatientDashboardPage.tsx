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
import { useAsync } from '@/hooks/useAsync'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { patientService } from '@/services'

export function PatientDashboardPage() {
  const { user } = useAuth()
  const { data: patient } = useAsync(() => patientService.getByUserId(user!.id), [user?.id])
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments({ patientId: patient?.id ?? '__none__' })
  const isLoading = appointmentsLoading || patient === undefined

  const today = toDateKey(new Date())
  const { upcoming, completed, cancelled } = useMemo(
    () => ({
      upcoming: appointments.filter((a) => a.date >= today && ['pending', 'confirmed', 'checked-in'].includes(a.status)),
      completed: appointments.filter((a) => a.status === 'completed'),
      cancelled: appointments.filter((a) => a.status === 'cancelled' || a.status === 'no-show'),
    }),
    [appointments, today],
  )
  const next = upcoming[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name.split(' ')[0]}`}
        description="Here's an overview of your care."
        actions={
          <Button asChild>
            <Link to={ROUTES.patient.book}>
              <CalendarPlus /> Book appointment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Upcoming" value={upcoming.length} icon={CalendarClock} loading={isLoading} description="Scheduled visits" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle2} tone="teal" loading={isLoading} description="Past visits" />
        <StatCard title="Cancelled / missed" value={cancelled.length} icon={XCircle} tone="rose" loading={isLoading} description="All time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Next appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {next ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-4">
                  <p className="text-sm font-medium text-accent-foreground">{formatDate(next.date, 'EEEE, MMM d')}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular-nums">
                    <Clock className="h-5 w-5 text-primary" /> {formatTime(next.time)}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{next.doctorName}</p>
                  <p className="text-muted-foreground">{next.reason}</p>
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
            columns={appointmentColumns(['doctor', 'date', 'time', 'type', 'status'])}
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
