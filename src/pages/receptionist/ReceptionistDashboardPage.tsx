import { useMemo, useState } from 'react'
import { CalendarDays, ClipboardCheck, Hourglass, UserX } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import { DataTable } from '@/components/common/DataTable'
import { FilterDropdown } from '@/components/common/FilterDropdown'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { StatCard } from '@/components/common/StatCard'
import { APPOINTMENT_STATUS_META } from '@/config/status'
import { useAppointments } from '@/hooks/useAppointments'
import { formatDate, toDateKey } from '@/lib/date'
import type { AppointmentStatus, SelectOption } from '@/types'

const STATUS_OPTIONS: SelectOption<AppointmentStatus>[] = (Object.keys(APPOINTMENT_STATUS_META) as AppointmentStatus[]).map(
  (value) => ({ value, label: APPOINTMENT_STATUS_META[value].label }),
)

export function ReceptionistDashboardPage() {
  const { data: appointments = [], isLoading } = useAppointments({ date: toDateKey(new Date()) })
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return appointments.filter(
      (a) =>
        (!statuses.length || statuses.includes(a.status)) &&
        (!q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q)),
    )
  }, [appointments, search, statuses])

  const count = (s: AppointmentStatus[]) => appointments.filter((a) => s.includes(a.status)).length

  return (
    <div className="space-y-6">
      <PageHeader title="Front desk" description={`Today · ${formatDate(new Date(), 'EEEE, MMMM d')}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Booked today" value={appointments.length} icon={CalendarDays} loading={isLoading} />
        <StatCard title="Awaiting arrival" value={count(['pending', 'confirmed'])} icon={Hourglass} tone="amber" loading={isLoading} />
        <StatCard title="Checked in" value={count(['checked-in', 'in-progress', 'completed'])} icon={ClipboardCheck} tone="teal" loading={isLoading} />
        <StatCard title="No-shows" value={count(['no-show'])} icon={UserX} tone="rose" loading={isLoading} />
      </div>
      <DataTable
        columns={appointmentColumns(['time', 'patient', 'doctor', 'type', 'status'])}
        data={filtered}
        getRowId={(a) => a.id}
        loading={isLoading}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search patient or doctor" />
            <FilterDropdown label="Status" options={STATUS_OPTIONS} selected={statuses} onChange={setStatuses} />
          </>
        }
      />
    </div>
  )
}
