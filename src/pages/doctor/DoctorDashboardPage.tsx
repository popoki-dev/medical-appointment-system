import { useMemo } from 'react'
import { CalendarDays, CheckCircle2, Clock, Users } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { useAppointments } from '@/hooks/useAppointments'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, toDateKey } from '@/lib/date'
import { doctorService } from '@/services'

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const { data: doctor } = useAsync(() => doctorService.getByUserId(user!.id), [user?.id])
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments({ doctorId: doctor?.id ?? '__none__' })
  const isLoading = appointmentsLoading || doctor === undefined

  const today = toDateKey(new Date())
  const stats = useMemo(() => {
    const todays = appointments.filter((a) => a.date === today && a.status !== 'cancelled')
    return {
      todays,
      waiting: todays.filter((a) => a.status === 'checked-in').length,
      done: todays.filter((a) => a.status === 'completed').length,
      patients: new Set(appointments.map((a) => a.patientId)).size,
    }
  }, [appointments, today])

  return (
    <div className="space-y-6">
      <PageHeader title={`Good day, ${user?.name}`} description={formatDate(new Date(), 'EEEE, MMMM d, yyyy')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's appointments" value={stats.todays.length} icon={CalendarDays} loading={isLoading} />
        <StatCard title="Waiting room" value={stats.waiting} icon={Clock} tone="amber" loading={isLoading} description="Checked in" />
        <StatCard title="Seen today" value={stats.done} icon={CheckCircle2} tone="teal" loading={isLoading} />
        <StatCard title="Total patients" value={stats.patients} icon={Users} loading={isLoading} description="Under your care" />
      </div>
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Today's schedule</h2>
        <DataTable
          columns={appointmentColumns(['time', 'patient', 'type', 'reason', 'status'])}
          data={stats.todays}
          getRowId={(a) => a.id}
          loading={isLoading}
          emptyTitle="No appointments today"
          emptyDescription="Enjoy the quiet — your schedule is clear."
        />
      </div>
    </div>
  )
}
