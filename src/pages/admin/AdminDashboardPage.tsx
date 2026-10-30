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
import { useAsync } from '@/hooks/useAsync'
import { toDateKey } from '@/lib/date'
import { formatPercent } from '@/lib/format'
import { departmentService, doctorService, patientService } from '@/services'

export function AdminDashboardPage() {
  const { data: appointments = [], isLoading } = useAppointments()
  const { data: meta } = useAsync(
    () => Promise.all([doctorService.list(), patientService.list(), departmentService.list()]),
    [],
  )
  const [doctors = [], patients = [], departments = []] = meta ?? []

  const { trend, byDepartment, completionRate, recent } = useMemo(() => {
    const today = new Date()
    const days = eachDayOfInterval({ start: subDays(today, 20), end: today })
    const perDay = new Map<string, number>()
    appointments.forEach((a) => perDay.set(a.date, (perDay.get(a.date) ?? 0) + 1))

    const perDept = new Map<string, number>()
    appointments.forEach((a) => perDept.set(a.departmentId, (perDept.get(a.departmentId) ?? 0) + 1))

    const past = appointments.filter((a) => a.date < toDateKey(today))
    const completed = past.filter((a) => a.status === 'completed').length

    return {
      trend: days.map((d) => ({ label: format(d, 'MMM d'), value: perDay.get(toDateKey(d)) ?? 0 })),
      byDepartment: departments
        .map((d) => ({ label: d.name, value: perDept.get(d.id) ?? 0 }))
        .sort((a, b) => b.value - a.value),
      completionRate: past.length ? (completed / past.length) * 100 : 0,
      recent: [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 25),
    }
  }, [appointments, departments])

  return (
    <div className="space-y-6">
      <PageHeader title="Hospital overview" description="Key metrics across all departments." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total appointments" value={appointments.length} icon={CalendarDays} loading={isLoading} trend={{ value: 12.5, label: 'vs. last month' }} />
        <StatCard title="Active doctors" value={doctors.length} icon={Stethoscope} tone="teal" loading={!meta} description={`${departments.length} departments`} />
        <StatCard title="Registered patients" value={patients.length} icon={Users} loading={!meta} trend={{ value: 8.2, label: 'vs. last month' }} />
        <StatCard title="Completion rate" value={formatPercent(completionRate)} icon={Activity} tone="amber" loading={isLoading} trend={{ value: -1.4, label: 'vs. last month' }} />
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
            {isLoading || !meta ? <LoadingState /> : <HorizontalBarChart data={byDepartment} valueLabel="Appointments" />}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Recent bookings</h2>
        <DataTable
          columns={appointmentColumns(['patient', 'doctor', 'date', 'time', 'status'])}
          data={recent}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={8}
        />
      </div>
    </div>
  )
}
