import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addDays } from 'date-fns'
import { SearchX, X } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchInput } from '@/components/common/SearchInput'
import { DoctorCard } from '@/components/doctors'
import { PageIntro } from '@/components/public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctorAvailability, useDoctors } from '@/hooks/useDoctors'
import { toDateKey } from '@/lib/date'
import type { DoctorAvailability } from '@/services'

const ALL = 'all'

const AVAILABILITY_OPTIONS = [
  { value: ALL, label: 'Any availability' },
  { value: 'today', label: 'Available today' },
  { value: 'tomorrow', label: 'Available tomorrow' },
  { value: 'week', label: 'Available this week' },
] as const
type AvailabilityFilter = (typeof AVAILABILITY_OPTIONS)[number]['value']

function matchesAvailability(filter: AvailabilityFilter, availability: DoctorAvailability | undefined) {
  if (filter === ALL) return true
  if (!availability) return false
  const free = (offset: number) => (availability.freeByDate[toDateKey(addDays(new Date(), offset))] ?? 0) > 0
  if (filter === 'today') return free(0)
  if (filter === 'tomorrow') return free(1)
  return Array.from({ length: 7 }, (_, i) => i).some(free)
}

export function DoctorsPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const departmentId = params.get('department') ?? ALL
  const specialization = params.get('specialization') ?? ALL
  const availabilityFilter = (AVAILABILITY_OPTIONS.find((o) => o.value === params.get('availability'))?.value ?? ALL) as AvailabilityFilter

  const setParam = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (!value || value === ALL) next.delete(key)
        else next.set(key, value)
        // A specialization from another department would hide every result.
        if (key === 'department') next.delete('specialization')
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  const { data: departments } = useDepartments('active')
  const { data: doctors, isLoading } = useDoctors({ status: 'active' })
  const { data: availability, isLoading: availabilityLoading } = useDoctorAvailability(doctors?.map((d) => d.id))
  const departmentById = useMemo(() => new Map((departments ?? []).map((d) => [d.id, d])), [departments])

  const specializations = useMemo(
    () =>
      [...new Set((doctors ?? []).filter((d) => departmentId === ALL || d.departmentId === departmentId).map((d) => d.specialization))].sort(),
    [doctors, departmentId],
  )

  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (doctors ?? [])
      .filter((d) => !q || d.fullName.toLowerCase().includes(q))
      .filter((d) => departmentId === ALL || d.departmentId === departmentId)
      .filter((d) => specialization === ALL || d.specialization === specialization)
      .filter((d) => matchesAvailability(availabilityFilter, availability?.[d.id]))
      .sort((a, b) => a.fullName.replace(/^Dr\.\s*/, '').localeCompare(b.fullName.replace(/^Dr\.\s*/, '')))
  }, [doctors, search, departmentId, specialization, availabilityFilter, availability])

  const hasFilters = !!search || departmentId !== ALL || specialization !== ALL || availabilityFilter !== ALL
  const waitingForAvailability = availabilityFilter !== ALL && availabilityLoading
  const loading = isLoading || waitingForAvailability

  return (
    <>
      <PageIntro
        eyebrow="Find a doctor"
        title="Our specialists"
        description="Search by name, narrow down by department or specialty, and see who has openings soon."
      />

      <section className="container py-10">
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="space-y-1.5">
              {/* SearchInput labels its own field; this caption only lines it up with the selects. */}
              <p className="text-sm font-medium leading-none" aria-hidden>
                Doctor name
              </p>
              <SearchInput value={search} onChange={(v) => setParam('q', v)} placeholder="Search doctors by name" className="sm:w-full" />
            </div>
            <FilterSelect
              id="filter-department"
              label="Department"
              value={departmentId}
              onChange={(v) => setParam('department', v)}
              options={[{ value: ALL, label: 'All departments' }, ...(departments ?? []).map((d) => ({ value: d.id, label: d.name }))]}
            />
            <FilterSelect
              id="filter-specialization"
              label="Specialization"
              value={specialization}
              onChange={(v) => setParam('specialization', v)}
              options={[{ value: ALL, label: 'All specializations' }, ...specializations.map((s) => ({ value: s, label: s }))]}
            />
            <FilterSelect
              id="filter-availability"
              label="Availability"
              value={availabilityFilter}
              onChange={(v) => setParam('availability', v)}
              options={[...AVAILABILITY_OPTIONS]}
            />
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? 'Loading doctors…' : `${results.length} ${results.length === 1 ? 'doctor' : 'doctors'} found`}
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}>
              <X /> Clear filters
            </Button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
          ) : results.length ? (
            results.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                department={departmentById.get(doctor.departmentId)}
                availability={availability?.[doctor.id]}
              />
            ))
          ) : (
            <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <EmptyState
                icon={SearchX}
                title={hasFilters ? 'No doctors match your filters' : 'No doctors listed yet'}
                description={hasFilters ? 'Try another department, a wider availability window or a different name.' : 'Please check back soon.'}
                action={
                  hasFilters && (
                    <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}>
                      Clear filters
                    </Button>
                  )
                }
              />
            </Card>
          )}
        </div>
      </section>
    </>
  )
}

interface FilterSelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FilterSelect({ id, label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
