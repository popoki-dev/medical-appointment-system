import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addDays } from 'date-fns'
import {
  ArrowLeft,
  BadgeDollarSign,
  Briefcase,
  CalendarOff,
  CalendarPlus,
  GraduationCap,
  Languages,
  Star,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { TimeSlotPicker } from '@/components/common/TimeSlotPicker'
import { DayStrip, DepartmentIcon, DoctorAvatar, NextAvailable, WeeklySchedule } from '@/components/doctors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/routes'
import { useDepartments } from '@/hooks/useDepartments'
import { useAvailableSlots, useDoctor, useDoctorAvailability, useDoctorSchedules } from '@/hooks/useDoctors'
import { formatDate, toDateKey } from '@/lib/date'
import { formatCurrency } from '@/lib/format'

const BOOKING_WINDOW_DAYS = 14

export function DoctorProfilePage() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { data: doctor, isLoading, error } = useDoctor(doctorId)
  const { data: departments } = useDepartments()
  const { data: schedules, isLoading: schedulesLoading } = useDoctorSchedules(doctorId)
  const { data: availabilityById } = useDoctorAvailability(doctorId ? [doctorId] : undefined, BOOKING_WINDOW_DAYS)
  const availability = doctorId ? availabilityById?.[doctorId] : undefined

  const dates = useMemo(
    () => Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => toDateKey(addDays(new Date(), i))),
    [],
  )
  const [selectedDate, setSelectedDate] = useState<string>()
  // Start on the first day with an opening once availability arrives.
  useEffect(() => {
    if (!selectedDate && availability) setSelectedDate(availability.next?.date ?? dates[0])
  }, [availability, selectedDate, dates])
  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots(doctor?.status === 'active' ? doctorId : undefined, selectedDate)

  if (isLoading) return <LoadingState variant="page" label="Loading doctor profile…" />
  if (error || !doctor || doctor.status === 'inactive') {
    return (
      <div className="container py-16">
        <Card>
          <EmptyState
            icon={UserX}
            title="Doctor not found"
            description="This profile doesn't exist or is no longer listed."
            action={
              <Button asChild>
                <Link to={ROUTES.doctors}>Browse all doctors</Link>
              </Button>
            }
            className="py-16"
          />
        </Card>
      </div>
    )
  }

  const department = departments?.find((d) => d.id === doctor.departmentId)
  const bookable = doctor.status === 'active'
  const bookHref = ROUTES.bookWith({ doctorId: doctor.id })

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/70 to-background">
        <div className="container py-8 md:py-12">
          <Link to={ROUTES.doctors} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All doctors
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
            <DoctorAvatar doctor={doctor} className="h-24 w-24 text-2xl md:h-28 md:w-28" />
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{doctor.fullName}</h1>
              <p className="text-lg text-primary">{doctor.specialization}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {department && (
                  <Link to={`${ROUTES.doctors}?department=${department.id}`} className="flex items-center gap-1.5 hover:text-primary">
                    <DepartmentIcon name={department.icon} className="h-4 w-4 text-secondary" /> {department.name}
                  </Link>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {doctor.rating.toFixed(1)} patient rating
                </span>
                {bookable && <NextAvailable availability={availability} />}
              </div>
            </div>
            {bookable && (
              <Button size="lg" asChild className="md:self-center">
                <Link to={bookHref}>
                  <CalendarPlus /> Book Appointment
                </Link>
              </Button>
            )}
          </div>
          {!bookable && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <CalendarOff className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {doctor.fullName} is currently on leave and isn't taking new appointments.{' '}
                {department && (
                  <Link to={`${ROUTES.doctors}?department=${department.id}`} className="font-medium underline">
                    See other {department.name.toLowerCase()} specialists
                  </Link>
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="container grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">About {doctor.fullName}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{doctor.biography}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Fact icon={GraduationCap} label="Qualifications" value={doctor.qualification} />
              <Fact icon={Briefcase} label="Experience" value={`${doctor.experience} years in practice`} />
              <Fact icon={Stethoscope} label="Specialization" value={doctor.specialization} />
              <Fact icon={Languages} label="Languages" value={doctor.languages.join(', ')} />
              <Fact icon={BadgeDollarSign} label="Consultation fee" value={formatCurrency(doctor.consultationFee)} />
              {department && (
                <Fact icon={({ className }) => <DepartmentIcon name={department.icon} className={className} />} label="Department" value={department.name} />
              )}
            </dl>
          </Card>

          {bookable && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Available appointments</h2>
              <p className="text-sm text-muted-foreground">Choose a day, then a time to start your booking.</p>
              <DayStrip dates={dates} value={selectedDate} onChange={setSelectedDate} freeByDate={availability?.freeByDate} className="mt-4" />
              <div className="mt-4">
                {selectedDate ? (
                  <TimeSlotPicker
                    slots={slots}
                    loading={slotsLoading}
                    onChange={(time) => navigate(ROUTES.bookWith({ doctorId: doctor.id, date: selectedDate, time }))}
                    emptyMessage={`${doctor.fullName} doesn't see patients on ${formatDate(selectedDate, 'EEEE, MMM d')}. Try another day.`}
                  />
                ) : (
                  <LoadingState label="Checking availability…" className="py-8" />
                )}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Weekly schedule</h2>
            <p className="mb-4 text-sm text-muted-foreground">Regular consultation hours.</p>
            {schedulesLoading ? <Skeleton className="h-72 rounded-lg" /> : <WeeklySchedule schedules={schedules ?? []} />}
          </Card>
          {bookable && (
            <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white">
              <h2 className="text-lg font-semibold">Ready to book?</h2>
              <p className="mt-1 text-sm text-white/85">
                Consultation fee {formatCurrency(doctor.consultationFee)}, payable at the hospital.
              </p>
              <Button className="mt-4 w-full bg-white text-primary hover:bg-white/90" asChild>
                <Link to={bookHref}>
                  <CalendarPlus /> Book Appointment
                </Link>
              </Button>
            </Card>
          )}
        </aside>
      </div>
    </>
  )
}

function Fact({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}
