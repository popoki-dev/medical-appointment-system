import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  Star,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { DepartmentIcon, DoctorAvatar, DoctorCard, describeNextSlot } from '@/components/doctors'
import { SectionHeading } from '@/components/public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HOSPITAL, telHref } from '@/config/hospital'
import { ROUTES } from '@/config/routes'
import { useAppointments } from '@/hooks/useAppointments'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctorAvailability, useDoctors } from '@/hooks/useDoctors'
import { usePatients } from '@/hooks/usePatients'
import { formatNumber } from '@/lib/format'
import type { Doctor } from '@/types'

const WHY_CHOOSE_US: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Award, title: 'Experienced specialists', text: 'Board-certified doctors with an average of over a decade in practice.' },
  { icon: CalendarCheck, title: 'Book online in minutes', text: 'See live availability and request a time that suits you, day or night.' },
  { icon: HeartHandshake, title: 'Patient-centred care', text: 'Unhurried consultations, clear explanations and care plans you help shape.' },
  { icon: ShieldCheck, title: 'Safe and accredited', text: 'Rigorous infection control and quality standards across every department.' },
  { icon: Languages, title: 'Care in your language', text: 'Our doctors consult in more than ten languages between them.' },
  { icon: Siren, title: '24/7 emergency care', text: 'Our emergency department is staffed around the clock, every day of the year.' },
]

export function HomePage() {
  const { data: departments, isLoading: departmentsLoading } = useDepartments('active')
  const { data: doctors, isLoading: doctorsLoading } = useDoctors({ status: 'active' })
  const { data: patients } = usePatients()
  const { data: completed } = useAppointments({ status: ['completed'] })

  const featured = useMemo(
    () => [...(doctors ?? [])].sort((a, b) => b.rating - a.rating || b.experience - a.experience).slice(0, 4),
    [doctors],
  )
  const { data: availability } = useDoctorAvailability(doctors?.map((d) => d.id))
  const departmentById = useMemo(() => new Map((departments ?? []).map((d) => [d.id, d])), [departments])

  // The hero card shows whichever doctor has the soonest free slot.
  const soonest = useMemo(() => {
    if (!doctors || !availability) return null
    return doctors
      .map((doctor) => ({ doctor, next: availability[doctor.id]?.next ?? null }))
      .filter((entry): entry is { doctor: Doctor; next: NonNullable<typeof entry.next> } => !!entry.next)
      .sort((a, b) => `${a.next.date}${a.next.startTime}`.localeCompare(`${b.next.date}${b.next.startTime}`))[0] ?? null
  }, [doctors, availability])

  const averageRating = doctors?.length ? doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length : null
  const stats = [
    { label: 'Specialist doctors', value: doctors ? formatNumber(doctors.length) : null },
    { label: 'Clinical departments', value: departments ? formatNumber(departments.length) : null },
    { label: 'Registered patients', value: patients ? formatNumber(patients.length) : null },
    { label: 'Consultations completed', value: completed ? formatNumber(completed.length) : null },
    { label: 'Average doctor rating', value: averageRating ? `${averageRating.toFixed(1)} / 5` : null },
    { label: 'Years caring for Springfield', value: formatNumber(new Date().getFullYear() - HOSPITAL.founded) },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/70 via-background to-background">
        <div className="container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {HOSPITAL.name} · Springfield, IL
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Health, <span className="text-primary">Our Priority.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Expert specialists in cardiology, neurology, pediatrics and orthopedics, with appointments you can book online
              in minutes. See who's available, choose a time that suits you and we'll take care of the rest.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={ROUTES.patient.bookWith()}>
                  <CalendarPlus /> Book an Appointment
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.doctors}>
                  Explore Our Doctors <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {averageRating ? `${averageRating.toFixed(1)} average doctor rating` : 'Highly rated doctors'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-secondary" /> Online booking 24/7
              </span>
              <span className="flex items-center gap-1.5">
                <Siren className="h-4 w-4 text-red-500" /> Emergency department always open
              </span>
            </div>
          </div>

          <HeroVisual soonest={soonest} loading={!availability} />
        </div>
      </section>

      {/* Statistics */}
      <section aria-label="Hospital statistics" className="border-b bg-card">
        <dl className="container grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <dd className="text-3xl font-semibold tracking-tight text-primary">
                {stat.value ?? <Skeleton className="mx-auto h-9 w-16" />}
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured departments */}
      <section className="container py-16 md:py-20">
        <SectionHeading
          eyebrow="Departments"
          title="Specialist care under one roof"
          description="Four clinical departments working together, so you see the right specialist the first time."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departmentsLoading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)
            : departments?.map((department) => {
                const count = doctors?.filter((d) => d.departmentId === department.id).length
                return (
                  <Card key={department.id} className="group flex flex-col p-6 transition-shadow hover:shadow-elevated">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                      <DepartmentIcon name={department.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold">{department.name}</h3>
                    <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">{department.description}</p>
                    <Link
                      to={`${ROUTES.doctors}?department=${department.id}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {count === undefined ? 'View doctors' : `View ${count} ${count === 1 ? 'doctor' : 'doctors'}`}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Card>
                )
              })}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to={ROUTES.departments}>All departments</Link>
          </Button>
        </div>
      </section>

      {/* Featured doctors */}
      <section className="border-y bg-card">
        <div className="container py-16 md:py-20">
          <SectionHeading
            align="left"
            eyebrow="Our doctors"
            title="Meet some of our specialists"
            description="Highly rated by patients and accepting new appointments."
            action={
              <Button variant="outline" asChild>
                <Link to={ROUTES.doctors}>
                  View all doctors <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctorsLoading ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            ) : featured.length ? (
              featured.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  department={departmentById.get(doctor.departmentId)}
                  availability={availability?.[doctor.id]}
                />
              ))
            ) : (
              <Card className="sm:col-span-2 lg:col-span-4">
                <EmptyState icon={Stethoscope} title="No doctors listed yet" description="Please check back soon." />
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container py-16 md:py-20">
        <SectionHeading
          eyebrow="Why choose us"
          title={`Why patients choose ${HOSPITAL.shortName}`}
          description={`Since ${HOSPITAL.founded} we've combined specialist expertise with the warmth of a community hospital.`}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking CTA */}
      <section className="container pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-12 text-white md:px-12">
          <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Ready to see a specialist?</h2>
              <p className="mt-2 max-w-xl text-white/85">
                Choose a doctor, pick a time and send your request. We'll confirm it shortly after.
              </p>
            </div>
            <Button size="lg" className="bg-white text-primary shadow-sm hover:bg-white/90" asChild>
              <Link to={ROUTES.patient.bookWith()}>
                <CalendarPlus /> Book an Appointment
              </Link>
            </Button>
          </div>
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-white/5" />
        </div>
      </section>

      {/* Hospital information */}
      <section className="border-t bg-card">
        <div className="container grid gap-8 py-16 md:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Visit us</h2>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {HOSPITAL.address.line1}
                <br />
                {HOSPITAL.address.line2}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">{HOSPITAL.parking}</p>
            <Link to={ROUTES.contact} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Directions and contact details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Outpatient hours</h2>
            <dl className="space-y-1.5 text-sm">
              {HOSPITAL.openingHours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{row.days}</dt>
                  <dd className="font-medium">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Call us</h2>
            <a href={telHref(HOSPITAL.phone)} className="flex items-center gap-2 text-sm hover:text-primary">
              <Phone className="h-4 w-4 text-primary" /> Main reception: <span className="font-medium">{HOSPITAL.phone}</span>
            </a>
            <a href={telHref(HOSPITAL.emergencyPhone)} className="flex items-center gap-2 text-sm hover:text-primary">
              <Siren className="h-4 w-4 text-red-500" /> Emergency: <span className="font-medium">{HOSPITAL.emergencyPhone}</span>
            </a>
            <p className="text-sm text-muted-foreground">Emergency department: {HOSPITAL.emergencyHours.toLowerCase()}.</p>
          </div>
        </div>
      </section>
    </>
  )
}

interface HeroVisualProps {
  soonest: { doctor: Doctor; next: { date: string; startTime: string } } | null
  loading: boolean
}

/** Illustration built from live data: a heartbeat panel plus the soonest bookable doctor. */
function HeroVisual({ soonest, loading }: HeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-elevated">
        <svg aria-hidden viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="white" strokeOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="500" height="400" fill="url(#hero-grid)" />
          <circle cx="250" cy="170" r="118" fill="white" fillOpacity="0.1" />
          <circle cx="250" cy="170" r="82" fill="white" fillOpacity="0.14" />
          {/* Medical cross */}
          <path d="M232 128h36v24h24v36h-24v24h-36v-24h-24v-36h24z" fill="white" />
          {/* Heartbeat line */}
          <path
            d="M0 300h150l18-34 22 70 26-118 24 104 16-22h244"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      <Card className="absolute -bottom-6 left-4 right-4 p-4 shadow-elevated sm:-left-6 sm:right-auto sm:w-80">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next available appointment</p>
        {loading ? (
          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : soonest ? (
          <Link
            to={ROUTES.patient.bookWith({ doctorId: soonest.doctor.id, date: soonest.next.date, time: soonest.next.startTime })}
            className="group mt-3 flex items-center gap-3"
          >
            <DoctorAvatar doctor={soonest.doctor} className="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold group-hover:text-primary">{soonest.doctor.fullName}</p>
              <p className="truncate text-sm text-muted-foreground">{soonest.doctor.specialization}</p>
              <span className="mt-1.5 inline-block rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                {describeNextSlot(soonest.next)}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">All doctors are fully booked for the next two weeks.</p>
        )}
      </Card>

      <div className="absolute -top-4 right-4 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-elevated sm:flex">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <div>
          <p className="text-xs font-semibold">Instant booking requests</p>
          <p className="text-[11px] text-muted-foreground">Confirmed by our front desk</p>
        </div>
      </div>
    </div>
  )
}
