import { useMemo } from 'react'
import { CalendarDays, CheckCircle2, Hourglass, Users } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { useDoctorByUserId } from '@/hooks/useDoctors'
import { formatDate, toDateKey } from '@/lib/date'

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const { data: doctor } = useDoctorByUserId(user?.id)
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(
    { doctorId: doctor?.id },
    { enabled: !!doctor },
  )
  const isLoading = appointmentsLoading || doctor === undefined

  const today = toDateKey(new Date())
  const stats = useMemo(() => {
    const todays = appointments.filter((a) => a.appointmentDate === today && a.status !== 'cancelled' && a.status !== 'rejected')
    return {
      todays,
      requests: appointments.filter((a) => a.status === 'pending' && a.appointmentDate >= today),
      done: todays.filter((a) => a.status === 'completed').length,
      patients: new Set(appointments.map((a) => a.patientId)).size,
    }
  }, [appointments, today])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${user?.fullName}`}
        description={`${doctor ? `${doctor.specialization} · ` : ''}${formatDate(new Date(), 'EEEE, MMMM d, yyyy')}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's appointments" value={stats.todays.length} icon={CalendarDays} loading={isLoading} />
        <StatCard title="Pending requests" value={stats.requests.length} icon={Hourglass} tone="amber" loading={isLoading} description="Awaiting confirmation" />
        <StatCard title="Seen today" value={stats.done} icon={CheckCircle2} tone="teal" loading={isLoading} />
        <StatCard title="Total patients" value={stats.patients} icon={Users} loading={isLoading} description="Under your care" />
      </div>
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Today's schedule</h2>
        <DataTable
          columns={appointmentColumns(['time', 'patient', 'reason', 'status'])}
          data={stats.todays}
          getRowId={(a) => a.id}
          loading={isLoading}
          emptyTitle="No appointments today"
          emptyDescription="Enjoy the quiet — your schedule is clear."
        />
      </div>
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Pending requests</h2>
        <DataTable
          columns={appointmentColumns(['patient', 'date', 'time', 'reason', 'status'])}
          data={stats.requests}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={5}
          emptyTitle="No pending requests"
          emptyDescription="New bookings from patients will appear here."
        />
      </div>
    </div>
  )
}
