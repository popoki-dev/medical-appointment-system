import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Briefcase, CalendarPlus, Languages, SearchX, Star } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/routes'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctors } from '@/hooks/useDoctors'
import { formatCurrency } from '@/lib/format'
import { getInitials } from '@/lib/utils'

const ALL = 'all'

export function FindDoctorsPage() {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const departmentId = params.get('department') ?? ALL
  const setParam = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (!value || value === ALL) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  const { data: departments = [] } = useDepartments('active')
  const { data: doctors = [], isLoading } = useDoctors({ status: 'active' })
  const departmentById = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments])

  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    return doctors
      .filter((d) => departmentId === ALL || d.departmentId === departmentId)
      .filter((d) => !q || d.fullName.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q))
      .sort((a, b) => b.rating - a.rating)
  }, [doctors, search, departmentId])

  return (
    <div className="space-y-6">
      <PageHeader title="Find Doctors" description="Browse our specialists and book directly with the one you choose." />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row">
        <SearchInput value={search} onChange={(v) => setParam('q', v)} placeholder="Search by name or specialty" className="sm:w-80" />
        <Select value={departmentId} onValueChange={(v) => setParam('department', v)}>
          <SelectTrigger className="sm:w-56" aria-label="Department">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {isLoading ? 'Loading doctors…' : `${results.length} ${results.length === 1 ? 'doctor' : 'doctors'} available`}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)
        ) : results.length ? (
          results.map((doctor) => (
            <Card key={doctor.id} className="flex flex-col p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  {doctor.profileImage && <AvatarImage src={doctor.profileImage} alt="" />}
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(doctor.fullName.replace(/^Dr\.?\s*/, ''))}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{doctor.fullName}</p>
                  <p className="text-sm text-primary">{doctor.specialization}</p>
                  <p className="text-sm text-muted-foreground">{departmentById.get(doctor.departmentId)?.name}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {doctor.rating.toFixed(1)} patient rating
                </li>
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> {doctor.experience} years' experience
                </li>
                <li className="flex items-center gap-2">
                  <Languages className="h-4 w-4" /> {doctor.languages.join(', ')}
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                <span className="text-sm">
                  <span className="font-semibold">{formatCurrency(doctor.consultationFee)}</span>
                  <span className="text-muted-foreground"> / visit</span>
                </span>
                <Button size="sm" asChild>
                  <Link to={ROUTES.bookWith({ doctorId: doctor.id })}>
                    <CalendarPlus /> Book
                  </Link>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 xl:col-span-3">
            <EmptyState
              icon={SearchX}
              title="No doctors match your search"
              description="Try another name, specialty or department."
              action={
                <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  Clear filters
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  )
}
