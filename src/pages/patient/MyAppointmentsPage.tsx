import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarPlus, X } from 'lucide-react'
import { patientAppointmentColumns } from '@/components/appointments/patientAppointmentColumns'
import { usePatientAppointmentActions } from '@/components/appointments/usePatientAppointmentActions'
import { DataTable } from '@/components/common/DataTable'
import { DatePicker } from '@/components/common/DatePicker'
import { FilterDropdown } from '@/components/common/FilterDropdown'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { APPOINTMENT_STATUS_META } from '@/config/status'
import { useAppointments } from '@/hooks/useAppointments'
import { useCurrentPatient } from '@/hooks/usePatients'
import { fromDateKey, toDateKey } from '@/lib/date'
import { cn } from '@/lib/utils'
import { isUpcoming } from '@/services'
import type { AppointmentDetails, AppointmentStatus } from '@/types'

const TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'upcoming', label: 'Upcoming', match: (a: AppointmentDetails, now: Date) => isUpcoming(a, now) },
  { value: 'pending', label: 'Pending', match: (a: AppointmentDetails) => a.status === 'pending' },
  { value: 'confirmed', label: 'Confirmed', match: (a: AppointmentDetails) => a.status === 'confirmed' },
  { value: 'completed', label: 'Completed', match: (a: AppointmentDetails) => a.status === 'completed' },
  { value: 'cancelled', label: 'Cancelled', match: (a: AppointmentDetails) => a.status === 'cancelled' },
] as const
type Tab = (typeof TABS)[number]['value']

const STATUS_OPTIONS = (Object.keys(APPOINTMENT_STATUS_META) as AppointmentStatus[]).map((value) => ({
  value,
  label: APPOINTMENT_STATUS_META[value].label,
}))

export function MyAppointmentsPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.find((t) => t.value === params.get('tab'))?.value ?? 'all'
  const search = params.get('q') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const statuses = (params.get('status')?.split(',') ?? []).filter((s): s is AppointmentStatus => s in APPOINTMENT_STATUS_META)

  const update = (patch: Record<string, string>) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(patch).forEach(([key, value]) => (value && value !== 'all' ? next.set(key, value) : next.delete(key)))
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  const { data: patient } = useCurrentPatient()
  const { data: appointments = [], isLoading } = useAppointments({ patientId: patient?.id }, { enabled: !!patient })
  const { viewDetails, requestCancel, dialogs } = usePatientAppointmentActions(patient?.id)

  // Search, dates and status apply first; the tabs then split what's left and show counts.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return appointments.filter(
      (a) =>
        (!q || [a.appointmentNumber, a.doctorName, a.departmentName, a.reason].some((v) => v.toLowerCase().includes(q))) &&
        (!from || a.appointmentDate >= from) &&
        (!to || a.appointmentDate <= to) &&
        (!statuses.length || statuses.includes(a.status)),
    )
  }, [appointments, search, from, to, statuses.join(',')])

  const { counts, rows } = useMemo(() => {
    const now = new Date()
    const counts = Object.fromEntries(TABS.map((t) => [t.value, filtered.filter((a) => t.match(a, now)).length])) as Record<Tab, number>
    const current = TABS.find((t) => t.value === tab)!
    const rows = filtered.filter((a) => current.match(a, now))
    // Upcoming reads soonest first; everything else most recent first.
    if (tab !== 'upcoming') rows.reverse()
    return { counts, rows }
  }, [filtered, tab])

  const columns = useMemo(() => patientAppointmentColumns(viewDetails, requestCancel), [viewDetails, requestCancel])

  const hasFilters = !!search || !!from || !!to || statuses.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="Every visit you've booked with us, past and upcoming."
        actions={
          <Button asChild>
            <Link to={ROUTES.bookAppointment}>
              <CalendarPlus /> Book appointment
            </Link>
          </Button>
        }
      />

      <div role="tablist" aria-label="Appointment status" className="-mx-1 flex gap-1 overflow-x-auto border-b px-1">
        {TABS.map((t) => {
          const active = t.value === tab
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => update({ tab: t.value })}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px] font-semibold leading-5 tabular-nums',
                  active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {isLoading ? '–' : counts[t.value]}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(a) => a.id}
        loading={isLoading || patient === undefined}
        pageSize={10}
        toolbar={
          <>
            <SearchInput value={search} onChange={(v) => update({ q: v })} placeholder="Search number, doctor, department…" className="sm:w-72" />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <DatePicker
                value={from ? fromDateKey(from) : undefined}
                onChange={(d) => update({ from: d ? toDateKey(d) : '' })}
                toDate={to ? fromDateKey(to) : undefined}
                placeholder="From date"
                className="sm:w-44"
              />
              <DatePicker
                value={to ? fromDateKey(to) : undefined}
                onChange={(d) => update({ to: d ? toDateKey(d) : '' })}
                fromDate={from ? fromDateKey(from) : undefined}
                placeholder="To date"
                className="sm:w-44"
              />
            </div>
            <FilterDropdown label="Status" options={STATUS_OPTIONS} selected={statuses} onChange={(s) => update({ status: s.join(',') })} />
            {hasFilters && (
              <Button variant="ghost" onClick={() => update({ q: '', from: '', to: '', status: '' })} className="sm:ml-auto">
                <X /> Clear
              </Button>
            )}
          </>
        }
        emptyTitle={hasFilters ? 'No appointments match your filters' : tab === 'all' ? 'No appointments yet' : `No ${tab} appointments`}
        emptyDescription={hasFilters ? 'Try a different search, date range or status.' : 'Appointments you book will appear here.'}
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={() => update({ q: '', from: '', to: '', status: '' })}>
              Clear filters
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to={ROUTES.bookAppointment}>Book appointment</Link>
            </Button>
          )
        }
      />

      {dialogs}
    </div>
  )
}
