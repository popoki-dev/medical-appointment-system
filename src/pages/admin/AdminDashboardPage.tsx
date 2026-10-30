import { useMemo } from 'react'
import { eachDayOfInterval, format, subDays } from 'date-fns'
import { Activity, CalendarDays, Stethoscope, Users } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppointments } from '@/hooks/useAppointments'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctors } from '@/hooks/useDoctors'
import { usePatients } from '@/hooks/usePatients'
import { toDateKey } from '@/lib/date'
import { formatPercent } from '@/lib/format'

export function AdminDashboardPage() {
  const { data: appointments = [], isLoading } = useAppointments()
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors({ status: 'active' })
  const { data: patients = [], isLoading: patientsLoading } = usePatients()
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments()

  const { trend, byDepartment, completionRate, recent, pending } = useMemo(() => {
    const today = new Date()
    const days = eachDayOfInterval({ start: subDays(today, 20), end: today })
    const perDay = new Map<string, number>()
    appointments.forEach((a) => perDay.set(a.appointmentDate, (perDay.get(a.appointmentDate) ?? 0) + 1))

    const perDept = new Map<string, number>()
    appointments.forEach((a) => perDept.set(a.departmentId, (perDept.get(a.departmentId) ?? 0) + 1))

    const past = appointments.filter((a) => a.appointmentDate < toDateKey(today))
    const completed = past.filter((a) => a.status === 'completed').length

    return {
      trend: days.map((d) => ({ label: format(d, 'MMM d'), value: perDay.get(toDateKey(d)) ?? 0 })),
      byDepartment: departments
        .map((d) => ({ label: d.name, value: perDept.get(d.id) ?? 0 }))
        .sort((a, b) => b.value - a.value),
      completionRate: past.length ? (completed / past.length) * 100 : 0,
      pending: appointments.filter((a) => a.status === 'pending').length,
      recent: [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 25),
    }
  }, [appointments, departments])

  return (
    <div className="space-y-6">
      <PageHeader title="Hospital overview" description="Key metrics across all departments." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total appointments" value={appointments.length} icon={CalendarDays} loading={isLoading} description={`${pending} awaiting confirmation`} />
        <StatCard title="Active doctors" value={doctors.length} icon={Stethoscope} tone="teal" loading={doctorsLoading || departmentsLoading} description={`Across ${departments.length} departments`} />
        <StatCard title="Registered patients" value={patients.length} icon={Users} loading={patientsLoading} description="With a patient profile" />
        <StatCard title="Completion rate" value={formatPercent(completionRate)} icon={Activity} tone="amber" loading={isLoading} description="Of past appointments" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Appointments per day</CardTitle>
            <CardDescription>Last 21 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingState /> : <TrendAreaChart data={trend} valueLabel="Appointments" />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>By department</CardTitle>
            <CardDescription>All appointments in period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || departmentsLoading ? <LoadingState /> : <HorizontalBarChart data={byDepartment} valueLabel="Appointments" />}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Recent bookings</h2>
        <DataTable
          columns={appointmentColumns(['number', 'patient', 'doctor', 'department', 'date', 'time', 'status'])}
          data={recent}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={8}
        />
      </div>
    </div>
  )
}
