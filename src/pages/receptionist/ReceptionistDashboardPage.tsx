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
  const today = toDateKey(new Date())
  // Everything from today on, across all doctors — the same live data the other portals use.
  const { data: appointments = [], isLoading } = useAppointments({ from: today })
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([])

  const todays = useMemo(() => appointments.filter((a) => a.appointmentDate === today), [appointments, today])
  const newBookings = useMemo(
    () => appointments.filter((a) => a.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [appointments],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return todays.filter(
      (a) =>
        (!statuses.length || statuses.includes(a.status)) &&
        (!q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q)),
    )
  }, [todays, search, statuses])

  const count = (s: AppointmentStatus[]) => todays.filter((a) => s.includes(a.status)).length

  return (
    <div className="space-y-6">
      <PageHeader title="Front desk" description={`Today · ${formatDate(new Date(), 'EEEE, MMMM d')}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Booked today" value={todays.length} icon={CalendarDays} loading={isLoading} />
        <StatCard title="Awaiting confirmation" value={newBookings.length} icon={Hourglass} tone="amber" loading={isLoading} description="All upcoming" />
        <StatCard title="Completed today" value={count(['completed'])} icon={ClipboardCheck} tone="teal" loading={isLoading} />
        <StatCard title="No-shows today" value={count(['no-show'])} icon={UserX} tone="rose" loading={isLoading} />
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Today's appointments</h2>
        <DataTable
          columns={appointmentColumns(['time', 'patient', 'doctor', 'department', 'status', 'payment'])}
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

      <div className="space-y-3">
        <h2 className="text-base font-semibold">New bookings to confirm</h2>
        <DataTable
          columns={appointmentColumns(['number', 'patient', 'doctor', 'date', 'time', 'status'])}
          data={newBookings}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={5}
          emptyTitle="No pending bookings"
          emptyDescription="New requests from patients will appear here automatically."
        />
      </div>
    </div>
  )
}
